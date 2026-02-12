// global.d.ts
export { };

declare global {
    interface Window {
        ethereum?: import("ethers").providers.ExternalProvider;
    }
}
