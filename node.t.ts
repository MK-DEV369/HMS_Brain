declare module 'NodeJS' {
  interface Timeout {
    unref?(): Timeout;
    ref?(): Timeout;
  }
}