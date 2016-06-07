import zlib from 'zlib';

export default function (data = {}) {
  const gzipped = zlib.gzipSync(new Buffer(JSON.stringify(data), 'utf-8'), (_, result) => result);

  return gzipped;
}

