import React from 'react';
import ComponentManager from 'sn-components-api';

export default class Home extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.editor = document.getElementById("editor");
    this.connectToBridge();
    this.addChangeListener();
    this.addTabHandler();
  }

  connectToBridge() {
    var permissions = [
      {
        name: "stream-context-item"
      }
    ]

    this.componentManager = new ComponentManager(permissions, function(){
      // on ready
    });

    this.componentManager.streamContextItem((note) => {
      this.note = note;

      // Only update UI on non-metadata updates.
      if (note.isMetadataUpdate) {
        return;
      }

      this.editor.value = note.content.text;
    });
  }
  
  addChangeListener() {
    document.getElementById("editor").addEventListener("input", (event) => {
      if (this.note) {
        // Be sure to capture this object as a variable, as this.note may be reassigned in `streamContextItem`, so by the time
        // you modify it in the presave block, it may not be the same object anymore, so the presave values will not be applied to
        // the right object, and it will save incorrectly.
        let note = this.note;

        this.componentManager.saveItemWithPresave(note, () => {
          note.content.text = this.editor.value;

          // clear previews
          note.content.preview_plain = null;
          note.content.preview_html = null;
        });
      }
    })
  }

  addTabHandler() {
    // Tab handler
    this.editor.addEventListener('keydown', function (event) {
      if (!event.shiftKey && event.which == 9) {
        event.preventDefault();

        // Using document.execCommand gives us undo support
        if (!document.execCommand("insertText", false, "\t")) {
          // document.execCommand works great on Chrome/Safari but not Firefox
          var start = this.selectionStart;
          var end = this.selectionEnd;
          var spaces = "    ";

          // Insert 4 spaces
          this.value = this.value.substring(0, start)
            + spaces + this.value.substring(end);

          // Place cursor 4 spaces away from where
          // the tab key was pressed
          this.selectionStart = this.selectionEnd = start + 4;
        }
      }
    });
  }

  render() {
    return (
      <textarea dir="auto" id="editor"></textarea>
    )
  }

}
