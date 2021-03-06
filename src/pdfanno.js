require("file?name=dist/index.html!./index.html");
require("!style!css!./pdfanno.css");

import { enableAnnotateTool, disableAnnotateTools, clearAllAnnotations } from './page/util/anno';
import { resetPDFViewerSettings } from './page/util/display';

import * as browseButton from './page/ui/browseButton';
import * as pdfDropdown from './page/ui/pdfDropdown';
import * as primaryAnnoDropdown from './page/ui/primaryAnnoDropdown';
import * as annoListDropdown from './page/ui/annoListDropdown';
import * as referenceAnnoDropdown from './page/ui/referenceAnnoDropdown';
import * as downloadButton from './page/ui/downloadButton';
import * as uploadButton from './page/ui/uploadButton';
import * as annotationTools from './page/ui/annotationTools';
import * as inputLabel from './page/ui/inputLabel';

import {
    listenWindowLeaveEvent,
    unlistenWindowLeaveEvent,
    resizeHandler,
    setupResizableColumns
} from './page/util/window';

import * as publicApi from './page/public';

/**
 * Expose public APIs.
 */
window.add = publicApi.addAnnotation;
window.addAll = publicApi.addAllAnnotations;
window.delete = publicApi.deleteAnnotation;
window.RectAnnotation = publicApi.PublicRectAnnotation;
window.SpanAnnotation = publicApi.PublicSpanAnnotation;
window.RelationAnnotation = publicApi.PublicRelationAnnotation;
window.readTOML = publicApi.readTOML;
window.clear = publicApi.clear;


// Check Ctrl or Cmd button clicked.
// ** ATTENTION!! ALSO UPDATED by core/index.js **
$(document).on('keydown', e => {

    if (e.keyCode === 17 || e.keyCode === 91) { // 17:ctrlKey, 91:cmdKey
        window.iframeWindow.ctrlPressed = true;
        console.log('ctrl press2!!');
    }

}).on('keyup', e => {

    // Allow any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return;
    }

    window.iframeWindow.ctrlPressed = false;

    if (e.keyCode === 49) {         // Digit "1"
        annotationTools.createSpan();
    } else if (e.keyCode === 50) {  // Digit "2"
        annotationTools.createRelation('one-way');
    } else if (e.keyCode === 51) {  // Digit "3"
        annotationTools.createRelation('two-way');
    } else if (e.keyCode === 52) {  // Digit "4"
        annotationTools.createRelation('link');
    }
});

/**
    Adjust the height of viewer according to window height.
*/
function adjustViewerSize() {
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}

/**
 * Start PDFAnno Application.
 */
function startApplication() {

    // Alias for convenience.
    window.iframeWindow = $('#viewer iframe').get(0).contentWindow;

    iframeWindow.addEventListener('DOMContentLoaded', () => {

        // Adjust the height of viewer.
        adjustViewerSize();

        // Reset the confirm dialog at leaving page.
        unlistenWindowLeaveEvent();

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('iframeDOMContentLoaded', true, true, null);
        window.dispatchEvent(event);

    });

    iframeWindow.addEventListener('annotationrendered', () => {

        // Restore the status of AnnoTools.
        disableAnnotateTools();
        enableAnnotateTool(window.currentAnnoToolType);

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('annotationrendered', true, true, null);
        window.dispatchEvent(event);
    });

    // Set the confirm dialog when leaving a page.
    iframeWindow.addEventListener('annotationUpdated', () => {
        listenWindowLeaveEvent();

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('annotationUpdated', true, true, null);
        window.dispatchEvent(event);
    });

    // enable text input.
    iframeWindow.addEventListener('enableTextInput', (e) => {
        console.log('enableTextInput:', e.detail);
        inputLabel.enable(e.detail);
    });

    // disable text input.
    iframeWindow.addEventListener('disappearTextInput', () => {
        console.log('disappearTextInput');
        inputLabel.disable(e.detail);
    });

    iframeWindow.addEventListener('annotationDeleted', e => {
        console.log('annotationDeleted:', e.detail);
        inputLabel.treatAnnotationDeleted(e.detail);
    });

    iframeWindow.addEventListener('annotationHoverIn' , e => {
        console.log('annotationHoverIn:', e.detail);
        inputLabel.handleAnnotationHoverIn(e.detail);
    });

    iframeWindow.addEventListener('annotationHoverOut' , e => {
        console.log('annotationHoverOut:', e.detail);
        inputLabel.handleAnnotationHoverOut(e.detail);
    });

    iframeWindow.addEventListener('annotationSelected' , e => {
        console.log('annotationSelected:', e.detail);
        inputLabel.handleAnnotationSelected(e.detail);
    });

    iframeWindow.addEventListener('annotationDeselected' , () => {
        console.log('annotationDeselected');
        inputLabel.handleAnnotationDeselected();
    });
    iframeWindow.addEventListener('digit1Pressed' , () => {
        annotationTools.createSpan();
    });
    iframeWindow.addEventListener('digit2Pressed' , () => {
        annotationTools.createRelation('one-way');
    });
    iframeWindow.addEventListener('digit3Pressed' , () => {
        annotationTools.createRelation('two-way');
    });
    iframeWindow.addEventListener('digit4Pressed' , () => {
        annotationTools.createRelation('link');
    });
}

/**
 *  The entry point.
 */
window.addEventListener('DOMContentLoaded', e => {

    // Delete prev annotations.
    clearAllAnnotations();

    // Reset PDFViwer settings.
    resetPDFViewerSettings();

    // Start application.
    startApplication();

    // Setup UI parts.
    browseButton.setup();
    pdfDropdown.setup();
    primaryAnnoDropdown.setup();
    referenceAnnoDropdown.setup();
    annoListDropdown.setup();
    downloadButton.setup();
    uploadButton.setup();
    annotationTools.setup();
    inputLabel.setup();

    window.addEventListener('restartApp', startApplication);

    // enable text input.
    window.addEventListener('enableTextInput', (e) => {
        inputLabel.enable(e.detail);
    });

    // disable text input.
    window.addEventListener('disappearTextInput', (e) => {
        inputLabel.disable(e.detail);
    });

    // resizable.
    setupResizableColumns();

});
