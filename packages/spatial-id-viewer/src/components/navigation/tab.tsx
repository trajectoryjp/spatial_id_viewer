import { Tabs, TabsProps, theme } from 'flowbite-react';
import { ReactNode } from 'react';

export interface NavigationTabGroupProps extends TabsProps {
  children?: ReactNode;
  setTabNumber: React.Dispatch<React.SetStateAction<number>>;
}

const tabitemStyle = theme.tabs.tablist.tabitem.base.replace(
  ' focus:ring-cyan-300 ',
  ' focus:ring-gray-500 '
);

export const NavigationTabGroup = ({
  children,
  setTabNumber,
  ...props
}: NavigationTabGroupProps) => {
  return (
    <Tabs
      theme={{
        base: 'flex flex-col',
        tablist: {
          styles: {
            default: 'flex-wrap border-b border-slate-400',
          },
          tabitem: {
            base: tabitemStyle,
            styles: {
              default: {
                active: {
                  on: 'text-gray-300 bg-gray-800/70',
                  off: 'text-gray-300 hover:bg-slate-500/60',
                },
              },
            },
          },
        },
        tabpanel: '',
      }}
      {...props}
      onActiveTabChange={(tab) => {
        setTabNumber(tab + 1);
      }}
    >
      {children}
    </Tabs>
  );
};
