import { NextApiRequest, NextApiResponse } from 'next';
import { NodeList } from 'subtitle';
import Result from 'types/Result';
import getSubs from 'utils/getSubs';

type ApiHandler<R, T = Record<string, string | string[]>> = (
  req: NextApiRequest & { query: T },
  res: NextApiResponse<R>
) => void;

const handler: ApiHandler<Result<NodeList>, { videoId?: string }> = async (
  req,
  res
) => {
  const { videoId } = req.query;
  if (!videoId) {
    return res
      .status(400)
      .send({ success: false, error: new Error('Missing video ID') });
  }

  const subs = await getSubs(videoId);
  return res.send({ success: true, data: subs });
};

export default handler;
