import {
    ChildBubble,
    NudgeBubble,
    PhotoBubble,
    StepDivider,
    TypingIndicator,
    type StepId,
} from "@/design-system";
import type { StepStarts } from "@/lib/exploration-context";
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

// Observe has no divider: it's where the chat begins.
const DIVIDER_STEPS: StepId[] = ["ask", "hypothesize", "investigate", "reflect"];

function Dividers({ stepStarts, at }: { stepStarts: StepStarts; at: number }) {
  return (
    <>
      {DIVIDER_STEPS.filter((id) => stepStarts[id] === at).map((id) => (
        <StepDivider key={id} stepId={id} />
      ))}
    </>
  );
}

export function ChatThread({
  messages,
  stepStarts,
  loading,
}: {
  messages: Message[];
  stepStarts: StepStarts;
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
          <Dividers stepStarts={stepStarts} at={i} />
          <MessageBubble msg={msg} />
        </React.Fragment>
      ))}
      {/* A step that has started but has no messages yet, e.g. Hypothesize
          while the child is still building their guess. */}
      <Dividers stepStarts={stepStarts} at={messages.length} />
      {loading && <TypingIndicator />}
    </ScrollView>
  );
}
