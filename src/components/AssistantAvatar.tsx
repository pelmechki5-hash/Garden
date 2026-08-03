interface AssistantAvatarProps {
  persona: 'seal' | 'human';
  className?: string;
}

export function AssistantAvatar({ persona, className }: AssistantAvatarProps) {
  return (
    <img
      className={className}
      src={persona === 'seal' ? '/images/seal-ai.jpg' : '/images/human-ai.svg'}
      alt=""
    />
  );
}
