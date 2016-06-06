import 'whatwg-fetch';
import Snapshot from './snapshot.js';
import JSZip from 'jszip';

export default class Spyware {

  constructor(username, password, courseName, exerciseName, url, submissionInterval = 0.5) {
    if (url === undefined) {
      throw new Error('Server url is undefined.');
    }
    this.courseName = courseName;
    this.exerciseName = exerciseName;
    this.username = username;
    this.password = password;
    this.url = url;
    this.snapshots = [];
    this.fileCache = {};
    this._timedSubmit(submissionInterval * 60 * 1000);
  }

  spyEvent(filename, contents, action) {
    const previous = this.fileCache[filename];

    // File was created??
    if (this.snapshotCache[this.filename] === undefined) {
      const patch = Snapshot.generatePatchData(this.filename, '', previous, true);
      this._addSnapshot(new Snapshot(this.courseName, this.exerciseName, 'text_insert', patch));
      this.fileCache[filename] = '';
    }

    const patch = Snapshot.generatePatchData(this.filename, previous, contents, false);
    this._addSnapshot(new Snapshot(this.courseName, this.exerciseName, action, patch));
    this.fileCache[filename] = contents;
  }

  fullFileSnapshot(file, cause, files) {
    const zip = this._generateZip(files);
    const metadata = { cause, file };
    const snapshot = new Snapshot(this.courseName, this.exerciseName, 'code_snapshot', zip, metadata);
    this._addSnapshot(snapshot);
    this.snapshotCache[file] = files[file];
  }

  _addSnapshot(snapshot) {
    this.snapshots.push(snapshot);
  }

  submit() {
    const old = this.snapshots;
    this.snapshots = [];

    if (old.length === 0) {
      return;
    }

    // JSON.stringify the body?
    // TODO: Get a real server
    fetch('http://gzip.josalmi.fi/', {
      method: 'POST',
      body: {
        url: this.url,
        data: JSON.stringify(old),
        username: this.username,
        password: this.password,
      },
    });
  }

  _timedSubmit(interval) {
    setInterval(this.submit.bind(this), interval);
  }

  /**
  /** files: { 'path/to/file': 'content' }
  */
  _generateZip(files) {
    const zip = new JSZip();
    Object.keys(files).forEach((fileName) => {
      zip.file(fileName, files[fileName]);
    });
    return zip.generate({ compression: 'DEFLATE' });
  }

  _aceSnapshotHandler(e) {
    if (this.filename === undefined) {
      return;
    }

    const previous = this.exercise.getFile(this.filename).asText();

    if (this.snapshotCache[this.filename] === undefined) {
      const patch = Snapshot.generatePatchData(this.filename, '', previous, true);
      this._addSnapshot(new Snapshot(this.exercise, 'insertText', patch));
    }

    const patch = Snapshot.generatePatchData(this.filename, previous, this.editor.getValue(), false);
    this._addSnapshot(new Snapshot(this.exercise, e.action, patch));
    this.snapshotCache[this.filename] = true;
    this.saveActiveFile();
  }
}
