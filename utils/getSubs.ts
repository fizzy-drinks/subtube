import { readFileSync } from 'fs';
import { join } from 'path';
import { NodeList, parseSync } from 'subtitle';

const getSubs = async (videoId: string): Promise<NodeList> => {
  const testFileContents = readFileSync(
    join(process.cwd(), 'public/assets/test.srt')
  ).toString();

  return parseSync(testFileContents);
};

export default getSubs;
