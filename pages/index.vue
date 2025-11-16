<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const notes = ref([]);
const selectedNote = ref(null);
const updatedNote = ref("");
const todaysNotes = computed(() => {
  return notes.value.filter((note) => {
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() === new Date().toDateString();
  });
});
const yesterdaysNotes = computed(() => {
  return notes.value.filter((note) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() === yesterday.toDateString();
  });
});
const earlierNotes = computed(() => {
  return notes.value.filter((note) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() < yesterday.toDateString();
  });
});
async function updateNote() {
  try {
    await $fetch(`/api/notes/${selectedNote.value.id}`, {
      method: "PATCH",
      body: {
        updatedNote: updatedNote.value.slice(0, 65535),
      },
    });
    selectedNote.value.text = updatedNote.value;
  }
  catch (error) {
    console.log(error.message);
  }
}
function selectNote(note) {
  selectedNote.value = note;
  updatedNote.value = note.text;
}
onMounted(async () => {
  notes.value = await $fetch("/api/notes");

  if (notes.value.length > 0) {
    selectedNote.value = notes.value[0];
    updatedNote.value = selectedNote.value.text;
  }
});
</script>

<template>
  <div class="flex bg-zinc-900 min-h-screen">
    <!-- sidebar -->
    <div class="bg-black w-[338px] p-8">
      <Logo />
      <!-- today container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Today
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in todaysNotes" :key="note.id" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote?.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote?.id !== note.id,
            }"
            @click="selectNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toDateString()
                  === new Date().toDateString()
                  ? 'Today'
                  : new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /today container -->
      <!-- yesterday container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Yesterday
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in yesterdaysNotes" :key="note.id" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote?.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote?.id !== note.id,
            }"
            @click="selectNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toDateString()
                  === new Date().toDateString()
                  ? 'Today'
                  : new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /yesterday container -->
      <!-- past 30 days container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Earlier
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in earlierNotes" :key="note.id" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote?.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote?.id !== note.id,
            }"
            @click="selectNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toDateString()
                  === new Date().toDateString()
                  ? 'Today'
                  : new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /past 30 days container -->
    </div>
    <!-- /sidebar -->
    <!-- button container -->
    <div class="w-full flex flex-col">
      <div class="flex justify-between w-full items-start p-8">
        <button class="inline-flex text-sx text-[#C2C2C5] hover:text-white items-center gap-2">
          <PencilIcon />
          Create note
        </button>
        <button class="text-[#6D6D73] hover:text-white" @click="selectedNote = null; updatedNote = ''">
          <TrashIcon />
        </button>
      </div>
      <!-- /button container -->
      <!-- note container -->
      <div class="max-w-[437px] mx-auto w-full flex-grow flex flex-col">
        <p class="text-[#929292] playfair">
          {{ selectedNote?.updated_at ? new Date(selectedNote.updated_at).toLocaleDateString() : new Date().toLocaleDateString() }}
        </p>
        <textarea
          id="note"
          v-model="updatedNote" maxlength="65535" name="note"
          class="text-[#D4D4D4] my-4 playfair note w-full bg-transparent focus:outline-none resize-none flex-grow"
          @input="updateNote"
        />
      </div>
    </div>
    <!-- /note container -->
  </div>
</template>

<style scoped>
.note {
  white-space: pre-line; /* Preserves newlines, collapses multiple spaces */
}
.note::-webkit-scrollbar {
  width: 6px; /* Slimmer width */
}

.note::-webkit-scrollbar-track {
  background: #333; /* Dark track */
}

.note::-webkit-scrollbar-thumb {
  background: #555; /* Darker thumb */
  border-radius: 3px;
}

.note::-webkit-scrollbar-thumb:hover {
  background: #666; /* Even darker on hover */
  }
</style>
