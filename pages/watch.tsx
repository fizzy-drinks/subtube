import intervalToDuration from 'date-fns/intervalToDuration';
import { GetServerSideProps } from 'next';
import { FC, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { NodeList, NodeCue } from 'subtitle';
import getSubs from 'utils/getSubs';

type WatchPageProps = {
  videoId: string;
  initSubs: NodeList;
};

const WatchPage: FC<WatchPageProps> = ({ videoId, initSubs }) => {
  const [player, setPlayer] = useState<YouTubePlayer>();
  const [videoLengthMs, setVideoLengthMs] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const timer = useRef<NodeJS.Timer>();
  const startTimer = async (event: YouTubeEvent) => {
    setTimeSeconds(await event.target.getCurrentTime());
    setVideoLengthMs((await event.target.getDuration()) * 1000);
    setPlayer(event.target);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      async () => setTimeSeconds(await event.target.getCurrentTime()),
      100
    );
  };

  const seek = (ms: number) => {
    player?.seekTo(ms / 1000, true);
    setTimeSeconds(ms / 1000);
  };

  const [subs, setSubs] = useState<NodeList>(initSubs);

  const currentCue = subs.find(
    (node): node is NodeCue =>
      node.type === 'cue' &&
      node.data.start / 1000 <= timeSeconds &&
      node.data.end / 1000 > timeSeconds
  )?.data;

  const formatCueTime = (time: number) => {
    const d = intervalToDuration({ start: 0, end: time });

    const min = (d.minutes || 0).toString().padStart(2, '0');
    const sec = (d.seconds || 0).toString().padStart(2, '0');
    const ms = (time % 1000).toString().padStart(3, '0');
    const minSec = `${min}:${sec}.${ms}`;
    return d.hours ? `${d.hours}:${minSec}` : minSec;
  };

  return (
    <div className='w-full'>
      <YouTube
        videoId={videoId}
        onReady={startTimer}
        opts={{
          width: '100%',
          height:
            typeof window !== 'undefined' ? window.innerHeight * 0.9 : 400,
        }}
      />
      <div className='flex bg-blue-900 relative h-2 mt-1'>
        {subs
          .filter((node): node is NodeCue => node.type === 'cue')
          .map((node) => node.data)
          .map((cue) => (
            <div
              key={`${cue.start}-${cue.end}`}
              className='absolute bg-orange-500 h-1 cursor-pointer'
              onClick={() => seek(cue.start)}
              style={{
                width:
                  typeof window !== 'undefined'
                    ? window.innerWidth *
                      ((cue.end - cue.start) / videoLengthMs)
                    : 1,
                left:
                  typeof window !== 'undefined'
                    ? window.innerWidth * (cue.start / videoLengthMs)
                    : 1,
              }}
            />
          ))}
      </div>
      <div className='flex items-center'>
        <div className='flex flex-col'>
          <div>
            <label htmlFor='start' className='inline-block w-12'>
              From
            </label>
            <input
              type='text'
              id='start'
              value={currentCue ? formatCueTime(currentCue.start) : ''}
              className='w-24'
              readOnly
            />
          </div>
          <div>
            <label htmlFor='end' className='inline-block w-12'>
              To
            </label>
            <input
              type='text'
              id='end'
              value={currentCue ? formatCueTime(currentCue.end) : ''}
              className='w-24'
              readOnly
            />
          </div>
        </div>
        <textarea value={currentCue?.text} className='flex-1' readOnly />
      </div>
    </div>
  );
};

export default WatchPage;

export const getServerSideProps: GetServerSideProps<WatchPageProps> = async ({
  query,
}) => {
  const defaultVideo = 'dQw4w9WgXcQ';

  const videoId = query?.v?.toString() ?? defaultVideo;
  return {
    props: {
      videoId,
      initSubs: await getSubs(videoId),
    },
  };
};
