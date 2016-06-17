import Snapshot from './snapshot.js';
import JSZip from 'jszip';
import compress from './compress.js';

class Spyware {

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

    if (previous === contents) {
      return;
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

  _ircEvent(data) {
    const snapshot = new Snapshot(this.courseName, this.exerciseName, 'irc_message', data, {});
    this._addSnapshot(snapshot);
  }

  submit() {
    const old = this.snapshots;
    this.snapshots = [];

    if (old.length === 0) {
      return;
    }

    const headers = new Headers();
    headers.append('X-Tmc-Version', 1);
    headers.append('X-Tmc-Username', this.username);
    headers.append('X-Tmc-Password', this.password);
    fetch(this.url, {
      method: 'POST',
      body: compress(old),
      headers,
    });
    // TODO: error handling (don't swallow errors)
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

module.exports = exports = Spyware;
