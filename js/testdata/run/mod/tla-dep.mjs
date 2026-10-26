console.log("tla-dep: before await");
export const value = await new Promise((resolve) => setTimeout(() => resolve("late value"), 10));
console.log("tla-dep: after await");
