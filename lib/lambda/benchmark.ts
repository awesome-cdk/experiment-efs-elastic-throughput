import * as crypto from "crypto";
import * as fs from "fs";

const rootDir = '/mnt/efs/'
const asyncWriteExperiment = async (bytes: number, repeatCount = 1) => {
    const times: number[] = [];
    let randomData;
    for (let i = 0; i < repeatCount; i++) {
        randomData = crypto.randomBytes(bytes);
        const filename = `${rootDir}${crypto.randomUUID()}`;
        const start = new Date().getTime();
        fs.writeFileSync(filename, randomData);
        const end = new Date().getTime();
        const time = end - start;
        times.push(time);
        randomData = undefined;
    }
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = (sum / times.length) || 0;
    return {sum, avg};
}
export const handler = async () => {
    if (!fs.existsSync(rootDir)) {
        fs.mkdirSync(rootDir);
    }


    const experiments = [
        {bytes: 1024, repeatCount: 10}, // 1KB, 10 times
        {bytes: 1024 * 1024, repeatCount: 10}, // 1MB, 10 times
        {bytes: 1024 * 1024 * 100, repeatCount: 10}, // 100MB, 10 times
    ];

    const globalRepeatCount = 5;
    const sleepMsBetweenRuns = 10 * 1000;

    for (let i = 0; i < globalRepeatCount; i++) {
        for (let experiment of experiments) {
            const bytes = experiment.bytes;
            const repeatCount = experiment.repeatCount;
            const result = await asyncWriteExperiment(bytes, repeatCount);

            console.log(`Written ${repeatCount} files of ${bytes} bytes in ${result.sum} ms. Average was ${result.avg} ms`)
        }

        console.log(`Sleeping ${sleepMsBetweenRuns}ms between experiment runs`)
        await new Promise(resolve => setTimeout(resolve, sleepMsBetweenRuns));
    }

}
