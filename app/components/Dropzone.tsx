// Dropzone.tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import {
    PhotoIcon,
} from "@heroicons/react/24/solid";

interface DropezoneProps {
    onFilesAdded: (files: any) => void;
    name?: string;
}
 
export default function Dropzone({ 
    onFilesAdded,
    name
}:DropezoneProps) {
    const onDrop = useCallback(acceptedFiles => {
      // Do something with the files
      onFilesAdded(acceptedFiles);
    }, [])

    //
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop
    });
  
    // Render the dropzone
    return (
      <div {...getRootProps()}>
        <input 
            {...getInputProps({
                // onClick: event => console.log(event),
                // role: 'button',
                // 'aria-label': 'drag and drop area',
                accept: ".pdf,.doc.,.docx,image*",
                name: name || undefined,
                id: name || undefined
            })}
        />
       
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
                <PhotoIcon
                    className="mx-auto h-12 w-12 text-gray-300"
                    aria-hidden="true"
                />
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    {
                        isDragActive
                        ? ('Drop the files here...')
                        : ("Drag 'n' drop some files here, or click to select files")
                    }
                </p>
            </div>
        </div>
      </div>
    )
  }