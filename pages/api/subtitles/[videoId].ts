import { readFileSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';
import { NodeList, parseSync } from 'subtitle';
import Result from 'types/Result';

type ApiHandler<R, T = Record<string, string | string[]>> = (
  req: NextApiRequest & { query: T },
  res: NextApiResponse<R>
) => void;

const handler: ApiHandler<Result<NodeList>, { videoId?: string }> = (
  req,
  res
) => {
  const { videoId } = req.query;
  if (!videoId) {
    return res
      .status(400)
      .send({ success: false, error: new Error('Missing video ID') });
  }

  const testFileContents = readFileSync(
    join(process.cwd(), 'public/assets/test.srt')
  ).toString();

  const lyricsArray = parseSync(testFileContents);

  return res.send({ success: true, data: lyricsArray });
};

export default handler;
