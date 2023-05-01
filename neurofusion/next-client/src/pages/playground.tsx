import React, { useState } from "react";

import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout } from "~/components/layouts";

const PlaygroundPage: NextPage = () => {
  const [selectedChannels, setSelectedChannels] = useState([]);

  // Define a function to generate an array of channel locations for the 10-10 montage
  const generateChannelLocations = (headCircumference: number, numChannels: number) => {
    const radius = headCircumference / (2 * Math.PI); // Calculate the radius of the head
    const angleIncrement = (2 * Math.PI) / numChannels; // Calculate the angle increment between channels
    const channelLocations = [];

    // Loop over the channels and calculate their x, y coordinates
    for (let i = 0; i < numChannels; i++) {
      const angle = i * angleIncrement;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const name = `CH${i + 1}`; // Generate a channel name

      channelLocations.push({ name, x, y });
    }

    return channelLocations;
  };

  const channelLocations = generateChannelLocations(56, 19); // Generate channel locations for a head circumference of 56cm and 19 channels

  // Define a function to render a single channel point
  const renderChannelPoint = (channel: { name: any; x: any; y: any }) => {
    const isSelected = selectedChannels.includes(channel.name);
    const fill = isSelected ? "red" : "black";
    const radius = isSelected ? 10 : 5;

    return (
      <circle
        key={channel.name}
        cx={channel.x}
        cy={channel.y}
        r={radius}
        fill={fill}
        stroke="black"
        strokeWidth="1"
        onClick={() => handleChannelSelect(channel.name)}
      />
    );
  };

  // Define a function to render all channel points
  const renderChannelPoints = () => {
    return channelLocations.map((channel) => {
      return renderChannelPoint(channel);
    });
  };

  // Define a function to handle channel selection
  const handleChannelSelect = (channelName: any) => {
    if (selectedChannels.includes(channelName)) {
      setSelectedChannels(selectedChannels.filter((name) => name !== channelName));
    } else {
      setSelectedChannels([...selectedChannels, channelName]);
    }
  };

  return (
    <DashboardLayout>
      <h1>Playground</h1>
      <div className="App">
        <svg viewBox="-60 -60 120 120" width="500" height="500">
          {renderChannelPoints()}
        </svg>
        {selectedChannels.length > 0 ? (
          <p>You have selected channels: {selectedChannels.join(", ")}</p>
        ) : (
          <p>Please select a channel.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlaygroundPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
