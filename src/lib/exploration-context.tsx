import { Message } from "@/lib/nudge-api";
import { createContext, useContext, useState } from "react";

type Exploration = {
  messages: Message[];
  addMessages: (...newMessages: Message[]) => void;
  reset: () => void;
};

const ExplorationContext = createContext<Exploration | null>(null);

export function ExplorationProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
    function addMessages(...newMessages: Message[]) { setMessages((prev) => [...prev, ...newMessages])}
    function reset(){
       setMessages([])
    }

        return (
        <ExplorationContext.Provider value={{messages, addMessages, reset}}>
            {children}
        </ExplorationContext.Provider>
        );
    
}
export function useExploration() {
  const ctx = useContext(ExplorationContext);
  if(!ctx){
    throw new Error("Must be used inside Exploration Provider")
  }
  return ctx;
}