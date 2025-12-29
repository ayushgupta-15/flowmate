export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description?: string; variant?: 'destructive' }) => {
      console.log('[toast]', title, description, variant);
    },
  };
}
