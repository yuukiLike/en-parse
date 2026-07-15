import { Badge, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Cloud, HardDrive, LibraryBig } from "lucide-react";

export function AppHeader() {
  return (
    <Group align="flex-end" justify="space-between" gap="md" wrap="wrap">
      <Group gap="sm">
        <ThemeIcon radius="md" size={44} variant="filled">
          <LibraryBig size={24} />
        </ThemeIcon>
        <Stack gap={2}>
          <Text c="dimmed" fw={800} size="xs" tt="uppercase">
            English phrase highlighter
          </Text>
          <Title order={1}>Phrase Lens</Title>
        </Stack>
      </Group>
      <Group gap="xs">
        <Badge leftSection={<HardDrive size={13} />} radius="sm" size="lg" variant="light">
          本地优先
        </Badge>
        <Badge leftSection={<Cloud size={13} />} color="blue" radius="sm" size="lg" variant="light">
          iCloud ready
        </Badge>
      </Group>
    </Group>
  );
}
