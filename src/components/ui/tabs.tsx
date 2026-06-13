import React, { createContext, useContext, useState } from 'react';
import { View, Text, Pressable, type ViewStyle } from 'react-native';

// 1. Create a Context to share the active tab state among children components
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be rendered within a <Tabs /> container');
  }
  return context;
}

// 2. The Main Root Tabs Container
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [localActiveTab, setLocalActiveTab] = useState(defaultValue);
  
  const activeTab = value !== undefined ? value : localActiveTab;
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setLocalActiveTab(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <View className={`flex flex-col w-full gap-4 ${className || ''}`}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

// 3. Tabs.List (Horizontal Container for Triggers)
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <View 
      className={`flex flex-row p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl ${className || ''}`}
    >
      {children}
    </View>
  );
}

// 4. Tabs.Trigger (The Interactive Tab Button)
interface TabsTriggerProps {
  value: string;
  children: string;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <Pressable
      onPress={() => setActiveTab(value)}
      className={`flex-1 py-2.5 items-center justify-center rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-white dark:bg-zinc-800 shadow-sm' 
          : 'bg-transparent'
      } ${className || ''}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Text 
        className={`text-sm tracking-wide ${
          isActive 
            ? 'text-zinc-900 dark:text-zinc-100 font-semibold' 
            : 'text-zinc-500 dark:text-zinc-400 font-medium'
        }`}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// 5. Tabs.Content (Conditionally Rendered Content Panel)
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabs();
  
  if (activeTab !== value) return null;

  return (
    <View className={`w-full py-2 ${className || ''}`}>
      {children}
    </View>
  );
}

// Export compound object for a more natural React API
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;
