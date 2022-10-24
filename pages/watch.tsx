import { GetServerSideProps } from 'next';
import { FC, useRef, useState } from 'react';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { parseSync, NodeList as SubNodeList, NodeCue } from 'subtitle';
import Result from '../types/Result';

type WatchPageProps = {
  videoId: string;
};

const WatchPage: FC<WatchPageProps> = ({ videoId }) => {
  const [timeSeconds, setTimeSeconds] = useState(0);
  const timer = useRef<NodeJS.Timer>();
  const startTimer = async (event: YouTubeEvent) => {
    setTimeSeconds(await event.target.getCurrentTime());
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      async () => setTimeSeconds(await event.target.getCurrentTime()),
      100
    );
  };

  const [subs, setSubs] = useState<SubNodeList>([]);
  const loadLyrics = () => {
    fetch('/api/subtitles/' + videoId)
      .then((r) => r.json())
      .then((r: Result<SubNodeList>) => {
        if (!r.success) return;

        setSubs(r.data);
      });
  };

  return (
    <div className='w-full max-w-[1280px]'>
      <YouTube videoId={videoId} onReady={startTimer} />
      <button onClick={loadLyrics}>load lyrics</button>
      {Math.floor(timeSeconds)}
      {
        subs.find(
          (node): node is NodeCue =>
            node.type === 'cue' &&
            node.data.start / 1000 < timeSeconds &&
            node.data.end / 1000 > timeSeconds
        )?.data.text
      }
    </div>
  );
};

export default WatchPage;

export const getServerSideProps: GetServerSideProps<
  WatchPageProps,
  { v?: string }
> = async ({ params }) => {
  const defaultVideo = 'dQw4w9WgXcQ';

  return {
    props: {
      videoId: params?.v ?? defaultVideo,
    },
  };
};
