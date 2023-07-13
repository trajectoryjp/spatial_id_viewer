import { Navigation } from '#app/components/navigation';
import { Viewer, ViewerContainer } from '#app/components/viewer';

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
