import Histogram from './Histogram';
import ImageInfo from './ImageInfo';

export default function RightPanel() {
  return (
    <div className="right-panel">
      <Histogram />
      <div className="panel-divider" />
      <ImageInfo />
    </div>
  );
}
