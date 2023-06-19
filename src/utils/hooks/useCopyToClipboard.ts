import { useState } from 'react';

type SupportedCopies = string | Blob;
type CopiedValue = SupportedCopies | null;
type CopyFn = (data: SupportedCopies) => Promise<boolean>; // Return success

function useCopyToClipboard(): [CopiedValue, CopyFn] {
    const [copiedData, setCopiedData] = useState<CopiedValue>(null);

    const copy: CopyFn = async (data) => {
        if (!navigator?.clipboard) {
            console.error('Clipboard not supported');
            return false;
        }

        // Try to save to clipboard then save it in the state if it worked
        try {
            if (typeof data === 'string') {
                await navigator.clipboard.writeText(data);
            } else if (data instanceof Blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': data }),
                ]);
            } else {
                throw new Error('Unsupported copy data type');
            }

            setCopiedData(data);
            return true;
        } catch (error) {
            console.error('Copy failed', error);
            setCopiedData(null);
            return false;
        }
    };

    return [copiedData, copy];
}

export default useCopyToClipboard;

// USAGE
// import React from 'react'

// import  useCopyToClipboard  from 'usehooks-ts'

// export default function Component() {
//   const [value, copy] = useCopyToClipboard()
//   return (
//     <>
//
//       <div >
//
//         <button onClick={() => copy('C')}>C</button>
//       </div>
//       <p>Copied value: {value ?? 'Nothing is copied yet!'}</p>
//     </>
//   )
// }
