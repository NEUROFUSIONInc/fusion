const fetch = require('isomorphic-fetch');
const jwt_decode = require("jwt-decode");
const dayjs = require('dayjs');
const dotenv = require('dotenv');

dotenv.config();

// environment
let environment = "prod"; // "staging"

let servers = {
  staging: process.env.MAGICFLOW_STAGING_SERVER,
  prod: process.env.MAGICFLOW_PROD_SERVER
}
let serverURL = servers[environment]


const DAY_SECS = 24 * 60 * 60;
const DAY = DAY_SECS * 1000;
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function currentTime() {
  // Return currentTime in secs since Jan 01 1970
  return Date.now() / 1000;
}

// Create a string representation of the date.
function formatDate(millis) {
  const date = new Date(+millis);
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Get millis from text
function timestamp(str) {
  return new Date(str).getTime();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Request sugar
function objToQueryString(obj) {
  const keyValuePairs = [];
  for (let i = 0; i < Object.keys(obj).length; i += 1) {
    keyValuePairs.push(
      `${encodeURIComponent(Object.keys(obj)[i])}=${encodeURIComponent(
        Object.values(obj)[i]
      )}`
    );
  }
  return keyValuePairs.join("&");
}

function decodeJWT(token) {
  return jwt_decode(token);
}


function getHeaders(upload) {
  const token = accessToken
  let headers = {
    "Access-Control-Allow-Headers": ["AI-Calls-Remaining", "AI-Call-Limit"],
    "Access-Control-Expose-Headers": ["AI-Calls-Remaining", "AI-Call-Limit"],
  };

  if (token != "") {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!upload) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

async function refresh(retry, refreshToken) {
  if (!refreshToken) {
    console.error("No refresh token found, you'll need to supply one for this to work!."); return
  }
  if (refreshToken?.length < 50) {
    console.error("refresh token isn't good, logging out", refreshToken);
  }
  let tokenDetails = decodeJWT(refreshToken);

  if (tokenDetails.exp < currentTime())
    console.error("Refresh token is out of date, get a new one.");

  await fetch(`${serverURL}/api/v1/user/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  }).then(async function(res) {
    ;
    // console.log({refreshres: res});
    if (res.status == 200) {
      let data = await res.json();
      // console.log({data})
      if (data.access_token) {
        accessToken = data.access_token;
        let tokenInfo = decodeJWT(data.access_token);
        if (tokenInfo.exp < currentTime()) {
          console.error(tokenInfo, "expired token received. very odd.")
          return;
        }
      }
      if (data.refresh_token) {
        refreshToken = data.refresh_token;
      }
      return data.access_token;
    } else {
      console.error(
        `Error, status: ${res.status}, ` + JSON.stringify(await res.json())
      );
    }
    if ((retry || 0) + 1 < 3) {
      retry = (retry || 0) + 1;
      return await refresh(retry, refreshToken)
    }
  }).then(r => { return r }).catch(e => console.error("Magicflow refresh function didn't complete: ", e));

  return accessToken;
}

async function request_sugar(type, endpoint, body, upload, isRetry, refreshToken) {
  endpoint =
    endpoint.startsWith("http") || endpoint.startsWith("localhost")
      ? endpoint
      : serverURL + endpoint;
  
  let accessToken = await refresh(0, refreshToken);
  // console.log({accessToken})
  if (!accessToken) return;
  let fetchOptions = {
    method: type,
    credentials: "include",
    body: body,
    headers: getHeaders(upload),
  };



  let promise = fetch(endpoint, fetchOptions)
    .then(async function(res) {
      // console.log(res)
      if (res.status === 500) {
        console.error(endpoint, "Server error! Something went wrong.");
        return res;
      }
      else if (
        res.status === 401 && !(res.url &&
          res.url.includes("spotify") ||
          res.url.includes("login"))
      ) {
        let response = await res.json();
        if (response && response.data && response.data.includes("verify your email")) return response.data;
        let accessToken = await refresh(0, refreshToken);
        if (accessToken && !isRetry)
          return await new Promise((resolve) =>
            setTimeout(
              () => resolve(request_sugar(type, endpoint, body, upload, true, refreshToken)),
              4000
            )
          );
      }
      else if (res.status === 204 || res.status === 401 || res.status === 500) {
        console.error(endpoint, res.status, res.statusText || "You do not have the required data uploaded.");
        return res.statusText;
      }
      else if (
        res.status.toString().startsWith("4") ||
        res.status.toString().startsWith("5")
      ) {
        let response = await res.json();
        throw new Error(JSON.stringify(response.data || response));
      } else {
        // console.log("Response good ", res);
        let text = res && await res.text();
        if (text.slice(0, 1000).includes("NaN")) console.log(text.slice(0, 1000))
        text = text.replace(/: NaN/g, ": 0");
        if (text.slice(0, 1000).includes("NaN")) console.log(text.slice(0, 1000))
        return JSON.parse(text);
      }
    })
    .catch((err) => {
      console.error(err)
        ;
      if (err.message && err.message.includes("Failed to fetch") && upload) {
        return new Promise((resolve) =>
          setTimeout(
            () => resolve(request_sugar(type, endpoint, body, upload, true, refreshToken)),
            4000
          )
        );
      }
      // return err;
    });
  let result = await promise;
  if (typeof result === "string") console.error("Error:", { result, endpoint });
  return result;
}

// Get request sugar
async function get_sugar(endpoint, params, refreshToken) {
  if (params) {
    let keyValuePairs = objToQueryString(params);
    endpoint = `${endpoint}?${keyValuePairs}`;
  }
  return request_sugar("GET", endpoint, null, false, false, refreshToken).catch((res) => {
    console.error(res)
      ;
  });
}

async function getData(dataName, source, noCache, extraParams, refreshToken) {
  source = source || "facebook";
  !dataName.includes("timeseries") ? source = "single/" + source : ""
  const params = {
    name: dataName,
    ...extraParams
  };
  let data = await get_sugar(`/api/v1/data/query/${source}/`, params, refreshToken).then(async res => {
    const data = res && await res;
    // console.log(data)
    if (!data || typeof data === "string") {
      return
    }
    return await data;
  });
  return data;
}

async function getTimeSeries(source, options, refreshToken) {
  options.range = options.range ? Object.fromEntries(Object.entries(options.range).map(date => { date[1] = dayjs(date[1]).format("YYYY-MM-DD"); return date })) : {}
  let data;
  if (options.daysInPast !== undefined) {
    let date = dayjs().subtract(4, "hour").subtract(options.daysInPast, "day").format("YYYY-MM-DD")
    data = await getData(
      "timeseries" + date.replace(/-/g, "_"),
      `time_series/${source}/` + date,
      options.daysInPast ? false : "noCache",
      {},
      refreshToken
    ).catch((error) => console.error(error));
  }
  else {
    data = await getData(
      "timeseries",
      `time_series/${source}`,
      "noCache",
      { ...(options.range || []) },
      refreshToken
    ).catch((error) => console.error(error));
  }
  if (data && data?.length) data = data.filter((a) => a)
  return data;
}

module.exports = getTimeSeries;