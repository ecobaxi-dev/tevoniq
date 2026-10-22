import { copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
for (const destination of ['.env', 'apps/api/.env', 'apps/web/.env']) {
  try {
    await copyFile(`${destination}.example`, destination, constants.COPYFILE_EXCL);
    console.log(`Created ${destination}`);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    console.log(`Kept existing ${destination}`);
  }
}
