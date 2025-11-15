<script setup>
import Swal from "sweetalert2";

const email = ref();
const password = ref();

async function submit() {
  try {
    await $fetch("/api/user", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });
    const { isConfirmed } = await Swal.fire({
      title: "Success!",
      text: "User created successfully!",
      icon: "success",
      confirmButtonText: "Log me in",
      theme: "auto",
    });
    if (isConfirmed) {
      navigateTo("/");
    }
  }
  catch (error) {
    Swal.fire({
      title: "Error!",
      text: error.response?._data.message,
      icon: "error",
      confirmButtonText: "OK",
      theme: "auto",
    });
  }
}
</script>

<template>
  <div class="flex bg-black h-screen">
    <!-- sidebar -->
    <div class="bg-zinc-900 w-[516px] p-16 flex flex-col justify-center">
      <Logo />
      <h1 class="text-white font-bold text-lg mt-8">
        Sign up for a free account
      </h1>
      <p class="text-zinc-300 text-sm mt-0.5 mb-12">
        Already registered? <span class="font-bold text-[#FFAC00] underline cursor-pointer">Log in</span> to your account
      </p>
      <form @submit.prevent="submit">
        <div class="mb-8">
          <label for="email" class="text-zinc-300 text-sm block mb-0.5">Email Address</label>
          <input v-model="email" placeholder="your@email.com" type="text" name="email" autocomplete="email" class="w-full bg-[#27272A] border border-[#3F3F46] rounded text-white p-2 placeholder:text-zinc-500 text-sm">
        </div>
        <div class="mb-8">
          <label for="password" class="text-zinc-300 text-sm block mb-0.5">Password</label>
          <input v-model="password" placeholder="**********************" type="password" name="password" autocomplete="current-password" class="w-full bg-[#27272A] border border-[#3F3F46] rounded text-white p-2 placeholder:text-zinc-500 text-sm">
        </div>
        <div>
          <button class="flex justify-center gap-2 items-center w-full bg-[#FFAC00] rounded-full px-4 py-2">
            Sign Up
            <ArrowRight />
          </button>
        </div>
      </form>
    </div>
    <!-- end sidebar -->
    <!-- note intro -->
    <!-- end note intro -->
  </div>
</template>
