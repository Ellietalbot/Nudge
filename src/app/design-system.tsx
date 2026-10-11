/**
 * In-app design system preview. Open it at /design-system while developing
 * (e.g. router.push('/design-system')). Delete this file before release if you like.
 */
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AdventureProgress, AIDisclosure, AnswerCards, BackLink, Button, ChildBubble, ConfidenceBubble, DiscoveryCount,
  DoodlePattern, EmptyState, ErrorState, ExplorerStickers, FindingCard, FoundItOut, GotIt, GraphPaper,
  HypothesisBuilder, IconCamera, IconCameraOff, IconCheck, IconCloudOff, IconEye, IconFlask, IconMic, InvestigationCard,
  JournalCover, JournalEntryPreview, JournalEntryRow, JournalSectionHeading, NudgeBubble, palette, PraisePill,
  ProblemToast, PromptCard, QuickReplies, SafetyCard, SkeletonCard, StepChip, StepDivider, StepPath, StepProgress,
  steps, Tag, Text, TextField, TypingIndicator, space,
} from '@/design-system';

function Group({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text variant="label" color={palette.navyMuted}>Part {num}</Text>
      <Text variant="heading">{title}</Text>
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.item}>
      <Text variant="label" color={palette.navyMuted}>{title}</Text>
      {children}
    </View>
  );
}

export default function DesignSystemScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="display">Nudge</Text>
        <Text variant="reading" color={palette.navyMuted}>Design system preview</Text>

        <Group num={1} title="Foundations">
          <Item title="Step colours">
            <View style={styles.row}>{steps.map(s => <StepChip key={s.id} stepId={s.id} />)}</View>
          </Item>
          <Item title="Type">
            <Text variant="heading">Why do leaves change colour?</Text>
            <Text variant="reading">Leaves have yellow and orange colours hiding inside them all year.</Text>
          </Item>
          <Item title="Graph paper (things the child keeps)">
            <GraphPaper style={styles.swatch}><View /></GraphPaper>
          </Item>
          <Item title="Doodle pattern (onboarding, empty states)">
            <View style={[styles.swatch, styles.clip]}><DoodlePattern /></View>
          </Item>
        </Group>

        <Group num={2} title="Components">
          <Item title="Buttons">
            <Button label="That's my guess" size="lg" fullWidth icon={p => <IconCheck {...p} />} />
            <Button label="Take another" variant="secondary" icon={p => <IconCamera {...p} />} />
            <Button label="Not now" variant="quiet" />
            <View style={styles.row}>
              <Button label="Talk" square size="lg" icon={p => <IconMic {...p} />} />
              <Button label="Photo" square size="lg" icon={p => <IconCamera {...p} />} />
            </View>
            <Button label="That's my guess" disabled reason="Pick a word for each blank first." />
          </Item>
          <Item title="Text field">
            <TextField label="What did you see?" placeholder="Like: three mushrooms in a ring" />
            <TextField label="Your guess" starter="I think" starterColor={steps[2].text} defaultValue="mushrooms need the tree roots." />
            <TextField label="What did you see?" defaultValue="stuff" hint="Ooh, tell me more! What colour was it?" />
          </Item>
          <Item title="Word tiles · the guess builder">
            <HypothesisBuilder
              parts={[0, 'change because they need to', 1, '.']}
              banks={[{ label: 'What?', words: ['Leaves', 'Ice', 'Seeds', 'Worms'] }, { label: 'Why?', words: ['get warm', 'get cold', 'get sunlight', 'get water'] }]}
            />
          </Item>
          <Item title="Answer cards">
            <AnswerCards question="Why do you think leaves fall in autumn?" answers={[
              { emoji: '🥶', label: 'It gets too cold for them', sublabel: 'Temperature changes' },
              { emoji: '💧', label: 'The tree stops drinking water', sublabel: 'Water and nutrients' },
              { emoji: '☀️', label: "There isn't enough sunlight", sublabel: 'Less daylight hours' },
            ]} />
          </Item>
          <Item title="Navigation">
            <View style={styles.topbar}><BackLink /><StepProgress current={2} /></View>
          </Item>
        </Group>

        <Group num={3} title="Talking with Nudge">
          <Item title="AI disclosure">
            <AIDisclosure compact />
            <AIDisclosure />
          </Item>
          <Item title="Chat">
            <StepDivider stepId="observe" />
            <NudgeBubble speak="What did you spot today?">What did you spot today?</NudgeBubble>
            <ChildBubble>I found a weird mushroom in the garden!</ChildBubble>
            <NudgeBubble speak="Great noticing! What colour is the top?">
              <PraisePill stepId="observe" />
              <Text variant="reading">What colour is the top?</Text>
            </NudgeBubble>
            <TypingIndicator />
          </Item>
          <Item title="Quick replies">
            <QuickReplies onPick={() => {}} replies={[
              { label: 'I have a guess!', forward: 'hypothesize' },
              { label: 'Let me look closer', icon: IconEye },
              { label: "I'm not sure" },
            ]} />
          </Item>
          <Item title="How sure Nudge is">
            <ConfidenceBubble level="confident">That's a mushroom! Look, but don't touch.</ConfidenceBubble>
            <ConfidenceBubble level="unsure">Let's look closer. What colour is underneath?</ConfidenceBubble>
          </Item>
          <Item title="Feedback">
            <GotIt message="Saved to your journal!" />
            <View style={styles.row}>{steps.map(s => <PraisePill key={s.id} stepId={s.id} />)}</View>
            <ProblemToast message="The camera didn't start." icon={IconCameraOff} onAction={() => {}} />
          </Item>
        </Group>

        <Group num={4} title="The scientific method">
          <StepPath />
          <AdventureProgress title="Mushroom adventure" current={3} />
          <PromptCard stepId="observe" question="What did you notice about the mushrooms?" example="they grow in a ring" photo />
          <InvestigationCard
            question="Do mushrooms need tree roots?"
            minutes="About 20 minutes a day"
            safety={[{ icon: 'touch', label: "Don't touch or eat" }, { icon: 'adult', label: 'With a grown-up' }]}
            materials={[{ emoji: '🪣', name: 'Watering can', quantity: 'Or a cup of water' }, { emoji: '📷', name: 'Your camera', quantity: 'To take a photo each day' }]}
            steps={[{ instruction: 'Find the mushroom ring near the tree.' }, { instruction: 'Water just the mushroom spot, every day for 3 days.', tip: 'Leave the grass next to it dry, so you can compare.' }]}
          />
          <SafetyCard level="doNotTouch" />
          <View style={styles.row}><Tag kind="time">About 20 minutes</Tag><Tag kind="safety" icon="adult">With a grown-up</Tag></View>
          <DiscoveryCount count={12} />
          <ExplorerStickers />
        </Group>

        <Group num={5} title="The journal">
          <JournalCover name="Mia" found={12} />
          <JournalSectionHeading kind="exploring" />
          <JournalEntryRow question="How do seeds know which way is up?" line="turning the jar upside down." date="2 Oct" stepId="investigate" />
          <JournalSectionHeading kind="found" />
          <JournalEntryPreview question="Why does moss grow on one side of the tree?" line="the shady side stays wet longer." stepId="reflect" done date="4 Oct" location="Park" />
          <FindingCard question="Why does the mushroom only grow near the oak tree?" guess="mushrooms need the tree roots." found="new ones grew where I watered." fact="Mushrooms and trees share food underground through tiny threads!" />
        </Group>

        <Group num={6} title="Screens & states">
          <EmptyState title="No discoveries yet!" body="Go outside and find something interesting. Your first discovery is waiting for you!" action={{ label: 'Start exploring', onPress: () => {} }} />
          <ErrorState title="Your journal didn't load" body="Nudge couldn't reach the internet. Your discoveries are safe." onRetry={() => {}} />
          <SkeletonCard />
          <View style={styles.row}><FoundItOut /><StepChip stepId="investigate" label="Still exploring · Investigate" /></View>
          <Item title="Icons"><View style={styles.row}><IconFlask /><IconCloudOff /><IconEye /></View></Item>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.cream },
  content: { padding: space[5], paddingBottom: space[20], gap: space[2] },
  group: { marginTop: space[10], gap: 2 },
  groupBody: { marginTop: space[5], gap: space[6] },
  item: { gap: space[3] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], alignItems: 'center' },
  swatch: { height: 140, borderRadius: 24 },
  clip: { overflow: 'hidden', backgroundColor: palette.cream, borderRadius: 24 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: palette.cream, borderRadius: 20, padding: space[3] },
});
