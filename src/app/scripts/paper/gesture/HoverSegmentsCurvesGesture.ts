import { PaperLayer } from 'app/scripts/paper/PaperLayer';
import {
  Cursor,
  Cursors,
  Guides,
  HitTests,
  Items,
  Pivots,
  Selections,
} from 'app/scripts/paper/util';
import { PaperService } from 'app/services';
import * as _ from 'lodash';
import * as paper from 'paper';

import { Gesture } from './Gesture';

/**
 * A gesture that performs hover operations over segments and curves.
 * This gesture is used only during 'edit path' mode.
 */
export class HoverSegmentsCurvesGesture extends Gesture {
  private readonly paperLayer = paper.project.activeLayer as PaperLayer;
  constructor(private readonly ps: PaperService) {
    super();
  }

  // @Override
  onMouseMove({ point }: paper.ToolEvent) {
    // Cursors.clear();
    // Guides.hidePenPathPreviewPath();
    // Guides.hideAddSegmentToCurveHoverGroup();
    const focusedEditPath = this.ps.getFocusedEditPath();
    const editPath = this.paperLayer.findItemByLayerId(focusedEditPath.layerId) as paper.Path;
    const hitResult = HitTests.editPathMode(editPath, point);
    if (!hitResult) {
      const singleSelectedSegment = this.findSingleSelectedEndSegment();
      if (singleSelectedSegment) {
        Cursors.set(Cursor.PenAdd);
        Guides.showPenPathPreviewPath(singleSelectedSegment, point);
      }
      return;
    }
    this.handleMouseMoveHit(hitResult);
  }

  private handleMouseMoveHit(hitResult: paper.HitResult) {
    // if (hitResult.type === 'segment') {
    //   const singleSelectedSegment = this.findSingleSelectedEndSegment();
    //   if (
    //     singleSelectedSegment &&
    //     ((singleSelectedSegment.isFirst() && hitResult.segment.isLast()) ||
    //       (singleSelectedSegment.isLast() && hitResult.segment.isFirst()))
    //   ) {
    //     Cursors.set(Cursor.PenAdd);
    //     Guides.showPenPathPreviewPath(singleSelectedSegment, hitResult.segment.point);
    //     return;
    //   }
    // }
    // switch (hitResult.type) {
    //   case 'segment':
    //   case 'handle-in':
    //   case 'handle-out':
    //     // Show a point select cursor if the user is hovering over
    //     // a segment or handle.
    //     Cursors.set(Cursor.PointSelect);
    //     break;
    //   case 'stroke':
    //   case 'curve':
    //     // Show a pen add cursor if the user is hovering over a curve
    //     // on the selected edit path.
    //     Cursors.set(Cursor.PenAdd);
    //     Guides.showAddSegmentToCurveHoverGroup(hitResult.location);
    //     break;
    // }
  }

  /**
   * Returns the single selected end point segment for the selected
   * edit path, or undefined if one doesn't exist.
   */
  private findSingleSelectedEndSegment() {
    const focusedEditPath = this.ps.getFocusedEditPath();
    const editPath = this.paperLayer.findItemByLayerId(focusedEditPath.layerId) as paper.Path;
    if (editPath.closed) {
      // Return undefined if the path is closed.
      return undefined;
    }
    const { selectedSegments } = focusedEditPath;
    if (selectedSegments.size !== 1) {
      // Return undefined if there is not a single selected segment.
      return undefined;
    }
    const { firstSegment, lastSegment } = editPath;
    if (!selectedSegments.has(firstSegment.index) && !selectedSegments.has(lastSegment.index)) {
      // Return undefined if neither end point is selected.
      return undefined;
    }
    return selectedSegments.has(firstSegment.index) ? firstSegment : lastSegment;
  }
}