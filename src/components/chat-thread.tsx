import {
    ChildBubble,
    NudgeBubble,
    PhotoBubble,
    StepDivider,
    TypingIndicator,
} from "@/design-system";
import { Message } from "@/lib/nudge-api";
import React, { useRef } from "react";
import { Image, ScrollView } from "react-native";

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === "assistant") {
    return <NudgeBubble first={true}>{String(msg.content)}</NudgeBubble>;
  }

  if (typeof msg.content === "string") {
    return <ChildBubble>{String(msg.content)}</ChildBubble>;
  }

  return (
    <>
      {msg.content.map((block, i) =>
        block.type === "image" ? (
          <PhotoBubble
            key={i}
            image={
              <Image
                source={{ uri: `data:image/jpeg;base64,${block.source.data}` }}
                style={{ width: "100%", aspectRatio: 1 }}
              />
            }
          />
        ) : (
          <ChildBubble key={i}>{block.text}</ChildBubble>
        ),
      )}
    </>
  );
}

export function ChatThread({
  messages,
  dividerAfter,
  loading,
}: {
  messages: Message[];
  dividerAfter: number;
  loading: boolean;
}) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        gap: 12,
        paddingVertical: 16,
      }}
      ref={scrollRef}
      onContentSizeChange={() =>
        scrollRef.current?.scrollToEnd({ animated: true })
      }
    >
      {messages.map((msg, i) => (
        <React.Fragment key={i}>
          <MessageBubble msg={msg} />
          {i === dividerAfter - 1 && <StepDivider stepId="ask" />}
        </React.Fragment>
      ))}
      {loading && <TypingIndicator />}
    </ScrollView>
  );
}
