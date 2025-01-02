"use server";
import { ID, Models, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { InputFile } from "node-appwrite/file";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrrentUser } from "./user.actions";
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};
export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, database } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );
    const fileDocuments = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      extension: getFileType(bucketFile.name).extension,
      accountId,
      users: [],
      bucketField: bucketFile.$id,
    };
    const newFile = await database
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocuments
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });
    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Error uploading file");
  }
};
const createQueries = (
  currentUser: Models.Document,
  types: FileType[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];
  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", [searchText]));
  if (limit) queries.push(Query.limit(limit));
  const [sortField, sortOrder] = sort.split("-");
  queries.push(
    sortOrder === "asc" ? Query.orderAsc(sortField) : Query.orderDesc(sortField)
  );
  return queries;
};
export const getFiles = async ({
  limit,
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
}: GetFilesProps) => {
  const { database } = await createAdminClient();
  try {
    const currentUser = await getCurrrentUser();
    if (!currentUser) throw new Error("User not found");
    const queries = createQueries(currentUser, types, searchText, sort, limit);
    const files = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );
    return parseStringify<Models.DocumentList<Models.Document>>(files);
  } catch (error) {
    handleError(error, "Error getting files");
    return undefined;
  }
};
export const renameFile = async ({
  fileId,
  extension,
  name,
  path,
}: RenameFileProps) => {
  const { database } = await createAdminClient();
  try {
    const newName = `${name}.${extension}`;
    const file = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      }
    );
    revalidatePath(path);
    return parseStringify<Models.Document>(file);
  } catch (error) {
    handleError(error, "Error renaming file");
  }
};
export const updateFileUser = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { database } = await createAdminClient();
  try {
    const file = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      }
    );
    revalidatePath(path);
    return parseStringify<Models.Document>(file);
  } catch (error) {
    handleError(error, "Error renaming file");
  }
};
export const deleteFile = async ({
  fileId,
  path,
  bucketFileId,
}: DeleteFileProps) => {
  const { database, storage } = await createAdminClient();
  try {
    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );
    revalidatePath(path);
  } catch (error) {
    handleError(error, "Error deleting file");
  }
};
export async function getTotalSpaceUsed() {
  try {
    const { database } = await createSessionClient();
    const currentUser = await getCurrrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])]
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}
