import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Download, RefreshCw, X } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FC, useEffect, useState } from "react";
import { AWClient, IBucket } from "aw-client";

import { Button, Input } from "~/components/ui";
import { activityWatchSteps } from "../data";
import dayjs from "dayjs";
import { writeDataToStore } from "~/services/storage.service";
import { appInsights } from "~/utils/appInsights";

interface IActivityWatchModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
}

export const ActivityWatchModal: FC<IActivityWatchModalProps> = ({ isOpen, onCloseModal }) => {
  const user = useSession();
  const [hostList, setHostList] = useState<{ [bucketId: string]: IBucket }>({});
  const [selectedHost, setSelectedHost] = useState("");

  const [startDate, setStartDate] = useState(dayjs().subtract(1, "month"));
  const [endDate, setEndDate] = useState(dayjs());

  const fetchHosts = () => {
    const awClient = new AWClient("fusionClient");
    awClient.getBuckets().then((buckets) => {
      setHostList(buckets);
    });
  };

  const fetchData = async (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    // make the aw cient calls here
    const awClient = new AWClient("fusionClient");
    const events = await awClient.getEvents(selectedHost, {
      start: startDate.toDate(),
      end: endDate.toDate(),
    });
    return events;
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  // Save selectedHost to local storage whenever it changes
  useEffect(() => {
    if (selectedHost) {
      localStorage.setItem("selectedActivityWatchHost", selectedHost);

      appInsights.trackEvent({
        name: "ActivityWatchHostSelected",
        properties: {
          userNpub: user?.data?.user?.name,
          unixTimestamp: dayjs().unix(),
        },
      });
    }
  }, [selectedHost]);

  // Load selectedHost from local storage on component mount
  useEffect(() => {
    const savedHost = localStorage.getItem("selectedActivityWatchHost");
    if (savedHost && hostList[savedHost]) {
      setSelectedHost(savedHost);
    }
  }, [hostList]);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="data-[state=open]:animate-overlayShow fixed inset-0 bg-slate-900/50"
          onPointerDown={onCloseModal}
        />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] z-30 h-auto max-h-[85vh] w-[450px] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-[6px] bg-white p-8 focus:outline-none dark:bg-slate-800 md:w-[600px]">
          <Dialog.Title className="mb-1 w-10/12 font-body text-lg md:w-full md:text-2xl">
            Connect ActivityWatch
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-gray-700 dark:text-gray-300 md:text-base">
            Choose your ActivityWatch host to fetch your screentime data
          </Dialog.Description>

          <Dialog.Close
            className="absolute top-10 right-8 rounded-full  opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
            onClick={onCloseModal}
          >
            <X />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {(!hostList || Object.keys(hostList).length === 0) && (
            <div>
              <h4 className="font-body text-lg">Steps</h4>
              <Accordion.Root type="single" collapsible className="divide-y dark:divide-slate-600">
                {activityWatchSteps.map((step) => (
                  <Accordion.Item key={step.id} value={`step-${step.id}`}>
                    <Accordion.Trigger className="flex w-full items-center justify-between py-4 transition-all [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center">
                        <div className="mr-4 flex h-4 w-4 items-center justify-center rounded-full bg-secondary-500 p-3 font-semibold text-white">
                          {step.id}
                        </div>
                        <p className="text-left font-medium">{step.step}</p>
                      </div>

                      <ChevronDown className="hidden transition-transform duration-200 sm:block" />
                    </Accordion.Trigger>
                    {step.image && (
                      <Accordion.Content>
                        <Image src={step.image} alt="Activity Watch Guide" width={600} height={300} />
                      </Accordion.Content>
                    )}
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </div>
          )}

          <div className="mt-8 flex w-full flex-wrap items-center gap-4 py-6 md:flex-nowrap">
            <Button type="submit" onClick={fetchHosts} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Fetch Hosts
            </Button>

            <div className="w-full">
              <label htmlFor="hostSelect" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Select ActivityWatch Host
              </label>
              <select
                id="hostSelect"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                value={selectedHost}
                onChange={(e) => setSelectedHost(e.target.value)}
              >
                <option value="">Choose a host</option>
                {Object.values(hostList).map((host, index) => (
                  <option key={index} value={host.id}>
                    {host.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hostList && Object.keys(hostList).length > 0 && (
            <div>
              <h4 className="font-body text-lg">Fetch Screentime Data</h4>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Start Date
                  </label>
                  <Input
                    type="datetime-local"
                    id="startDate"
                    defaultValue={startDate.format("YYYY-MM-DDTHH:mm")}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    onChange={(e) => setStartDate(dayjs(e.target.value))}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    End Date
                  </label>
                  <Input
                    type="datetime-local"
                    id="endDate"
                    defaultValue={endDate.format("YYYY-MM-DDTHH:mm")}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    onChange={(e) => setEndDate(dayjs(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button
                  intent="primary"
                  className="w-full"
                  onClick={async () => {
                    // Add logic to fetch data here
                    const events = await fetchData(dayjs(startDate), dayjs(endDate));

                    // parse the list into a csv dataset
                    const data = events.map((event) => ({
                      unixTimestamp: dayjs(event.timestamp).unix(),
                      duration_secs: event.duration,
                      app: event.data?.app,
                      title: event.data?.title,
                    }));

                    console.log("Length of events", events.length);
                    console.log("Length of data", data.length);

                    writeDataToStore("activitywatch", data, endDate.unix().toString(), "download");

                    appInsights.trackEvent({
                      name: "ActivityWatchDataDownloaded",
                      properties: {
                        userNpub: user?.data?.user?.name,
                        unixTimestamp: dayjs().unix(),
                      },
                    });
                  }}
                  leftIcon={<Download className="mr-2 h-4 w-4" />}
                  disabled={!selectedHost}
                >
                  Get Screentime Events
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
