"use client";

import useUser from "@/hooks/useUser";
import { usePathname } from "next/navigation";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { v4 as uuid } from "uuid";

const LiveStream = ({ roomid }: { roomid: string }) => {
  const searchParams = new URLSearchParams();
  const pathname = usePathname();
  const { fullName } = useUser();

  const role_str = searchParams.get("role") || "Host";
  const role =
    role_str === "Host"
      ? ZegoUIKitPrebuilt.Host
      : role_str === "Cohost"
      ? ZegoUIKitPrebuilt.Cohost
      : ZegoUIKitPrebuilt.Audience;

  const sharedLinks: { name: string; url: string }[] = [];
  const currentUrl = window.location.host + pathname;

  if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
    // Add the co-host link
    sharedLinks.push({
      name: "Join as co-host",
      url: `${currentUrl}?role=Cohost`,
    });
  }

  // Add the audience link
  sharedLinks.push({
    name: "Join as audience",
    url: `${currentUrl}?role=Audience`,
  });

  const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
  const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appID,
    serverSecret,
    roomid,
    uuid(),
    fullName || "User" + Date.now(),
    7200 // expires in 2 hours
  );

  // start the call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myMeeting: any = async (element: any) => {
    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.LiveStreaming,
        config: {
          role,
        },
      },
      sharedLinks,
    });
  };

  return <section ref={myMeeting} className="w-full h-screen" />;
};

export default LiveStream;
