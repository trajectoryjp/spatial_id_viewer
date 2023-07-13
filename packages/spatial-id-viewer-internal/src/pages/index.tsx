import { Navigation } from '#app/components/navigation';
import { ViewerContainer } from '#app/components/viewer';

import { Viewer } from '#app-internal/components/viewer';

/** トップページ */
const Index = () => {
  return (
    <ViewerContainer>
      <Viewer />
      <Navigation>
        <p>右上の ≡ ボタンから機能を選択してください</p>
      </Navigation>
    </ViewerContainer>
  );
};

export default Index;
