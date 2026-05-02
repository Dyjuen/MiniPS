import EnhanceTab from './tabs/EnhanceTab';
import RestoreTab from './tabs/RestoreTab';
import EdgeTab from './tabs/EdgeTab';
import MoreTab from './tabs/MoreTab';

export default function LeftPanel() {
  return (
    <div className="left-panel">
      <div>LeftPanel</div>
      <EnhanceTab />
      <RestoreTab />
      <EdgeTab />
      <MoreTab />
    </div>
  );
}
