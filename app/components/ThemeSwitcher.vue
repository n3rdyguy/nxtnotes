<script setup lang="ts">
const colorMode = useColorMode();

const themeIcon = computed(() => {
  switch (colorMode.preference) {
    case "system":
      return "tabler:device-desktop";
    case "light":
      return "tabler:sun";
    case "dark":
      return "tabler:moon";
    default:
      return "tabler:device-desktop";
  }
});

function toggleTheme() {
  const modes = ["system", "light", "dark"];
  const currentIndex = modes.indexOf(colorMode.preference || "system");
  const nextIndex = (currentIndex + 1) % modes.length;
  const nextMode = modes[nextIndex];
  if (nextMode) {
    colorMode.preference = nextMode;
  }
}
</script>

<template>
  <button
    class="text-zinc-500 dark:text-zinc-400 hover:text-brand dark:hover:text-brand transition-colors"
    @click="toggleTheme"
  >
    <Icon :name="themeIcon" size="20" />
  </button>
</template>
