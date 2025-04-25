// ix works {
//   data: Uint8Array(48) [
//     144,  37, 164, 136, 188, 216,  42, 248,   1,
//      35,   0,   0,   0,  97, 112, 112, 114, 111,
//     118, 101,  32, 102, 114, 111, 109,  32, 116,
//     101, 115, 116,  32,  98, 121,  32,  97, 110,
//     111, 116, 104, 101, 114,  32, 109, 101, 109,
//      98, 101, 114
//   ],
//   programAddress: 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf',
//   accounts: [
//     {
//       address: '7QbxACoBK9dKE8Sz1WFerTyuYgzq7CnbNLSPM1h3Aqi2',
//       role: 0
//     },
//     {
//       address: 'G5JD6WrkWjMFhRoiNiA6x3mELZPJvETFbv2jvKFePnmY',
//       role: 3
//     },
//     {
//       address: 'F2XdmxXvfJj8ZF3na6tNniHMD22ghndS1pw4KMFCnUiH',
//       role: 1
//     }
//   ]
// }

// ix error {
//   instruction: TransactionInstruction {
//     keys: [
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object],
//       [Object]
//     ],
//     programId: PublicKey [PublicKey(SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf)] {
//       _bn: <BN: 681c4ce47e22368b8b1555ec887af092efc7efbb66ca3f52fbf68d4ac9cb7a8>
//     },
//     data: <Buffer c2 08 a1 57 99 a4 19 ab>
//   },
//   lookupTableAccounts: []
// }

--------------------------------------------------------------------------------- 

// tx work {
//   instructions: [
//     {
//       data: [Uint8Array],
//       programAddress: 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf',
//       accounts: [Array]
//     }
//   ],
//   version: 0,
//   feePayer: {
//     address: 'G5JD6WrkWjMFhRoiNiA6x3mELZPJvETFbv2jvKFePnmY',
//     keyPair: { privateKey: CryptoKey {}, publicKey: CryptoKey {} },
//     signMessages: [Function: signMessages],
//     signTransactions: [Function: signTransactions]
//   },
//   lifetimeConstraint: {
//     blockhash: '7doadch7JXgbzqkMsUkhetgBYML76Q9uaJYDNSyA2Nrh',
//     lastValidBlockHeight: 314069799n
//   }
// }

// tx error {
//   instructions: [
//     TransactionInstruction {
//       keys: [Array],
//       programId: [PublicKey [PublicKey(SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf)]],
//       data: <Buffer c2 08 a1 57 99 a4 19 ab>
//     }
//   ],
//   version: 0,
//   feePayer: {
//     address: 'FUJoZ7doNKNUjvvYo5bswziKZi1BZm9myhF9k3QfHPu6',
//     keyPair: { privateKey: CryptoKey {}, publicKey: CryptoKey {} },
//     signMessages: [Function: signMessages],
//     signTransactions: [Function: signTransactions]
//   },
//   lifetimeConstraint: {
//     blockhash: '3H51Fop7dq8ba4Q7NgTFETZzZi7Bgr6A3Sf4Qhn8HCRy',
//     lastValidBlockHeight: 314069800n
//   }
// }
