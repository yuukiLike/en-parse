import { Button, Group, Paper, Stack, Textarea, Title, Tooltip } from "@mantine/core";
import { Eraser, FileText, ScanText } from "lucide-react";

type PastePanelProps = {
  sourceText: string;
  onAnalyze: () => void;
  onChange: (value: string) => void;
  onClear: () => void;
  onLoadSample: () => void;
};

export function PastePanel({
  sourceText,
  onAnalyze,
  onChange,
  onClear,
  onLoadSample,
}: PastePanelProps) {
  return (
    <Paper className="toolPanel" withBorder>
      <Stack className="panelStack" gap={0}>
        <Group className="panelHeader" justify="space-between">
          <Title order={2}>Paste</Title>
          <Tooltip label="加载示例文本">
            <Button leftSection={<FileText size={16} />} size="sm" variant="default" onClick={onLoadSample}>
              示例
            </Button>
          </Tooltip>
        </Group>
        <Textarea
          aria-label="Paste English paragraph"
          classNames={{ input: "sourceTextarea" }}
          minRows={18}
          spellCheck={false}
          value={sourceText}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <Group className="panelFooter" grow>
          <Button leftSection={<ScanText size={17} />} onClick={onAnalyze}>
            分析短语
          </Button>
          <Button leftSection={<Eraser size={17} />} variant="default" onClick={onClear}>
            清空
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
