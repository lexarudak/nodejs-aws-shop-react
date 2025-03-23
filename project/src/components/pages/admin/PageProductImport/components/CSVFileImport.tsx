import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useMutation } from "react-query";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const mutation = useMutation(
    async (file: File) => {
      console.log("Uploading file to", url);

      const response = await axios({
        method: "GET",
        url,
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
        params: {
          name: encodeURIComponent(file.name),
        },
      });

      console.log("Uploading to S3 URL:", response.data);
      const result = await fetch(response.data, {
        method: "PUT",
        body: file,
      });

      console.log("Result: ", result);
      setFile(undefined);
      return result;
    }
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) { 
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const startUpload = () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    mutation.mutate(file);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={startUpload}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
