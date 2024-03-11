import { promises as fs } from 'fs';
import { join, resolve } from 'path';

type EventInfo = {
    eventName: string;
    path: string;
  };

// Function to recursively find files
async function findFiles(directory: string, pattern: RegExp): Promise<string[]> {
    let filesList: string[] = [];

    async function find(directory: string) {
        const files = await fs.readdir(directory, { withFileTypes: true });
        for (const file of files) {
            if (file.isDirectory()) {
                await find(join(directory, file.name));
            } else if (pattern.test(file.name)) {
                filesList.push(join(directory, file.name));
            }
        }
    }

    await find(directory);

    return filesList;
}

function extractKeywordsAfterPackages(path: string): string {
      const parts = path.split('/'); // Split the path into parts
      const packagesIndex = parts.findIndex(part => part === 'packages'); // Find the index of 'packages'
      if (packagesIndex >= 0 && parts[packagesIndex + 1]) {
          return parts[packagesIndex + 1]; // Return the part right after 'packages'
      }
      return ''; // In case 'packages' is not found or is the last element
}

function convertToCamelCase(paths: string[]): EventInfo[] {
    return paths.map(path => {
        // Extract the filename without the directory path
        const filename = path.split('/').pop()?.replace('.event.ts', '') ?? '';
        // Split the filename by '-' to work on converting it to camelCase
        const parts = filename.split('-');
        // Convert to camelCase
        return {eventName: parts.map((part) => {
            // Keep the first part in lowercase, capitalize the first letter of the subsequent parts
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(''), path};
    });
}

function expandArrayWithFailedVariants(originalArray: EventInfo[]): EventInfo[]{
    let newArray: EventInfo[] = [];

    originalArray.forEach(item => {
        newArray.push(item); // Add the original item
        newArray.push({...item, eventName: `${item.eventName}Failed`}); // Add the item with "Failed" appended
    });

    return newArray;
}

function generateCode(events: EventInfo[]): string {

  const importStatements: Record<string, Set<string>> = {};
  events.forEach(({ eventName, path }) => {
    if (!importStatements[path]) {
      importStatements[path] = new Set();
    }
    importStatements[path].add(eventName);
  });

  const imports = Object.entries(importStatements)
    .map(([path, eventNames]) => `import { ${Array.from(eventNames).join(", ")} } from "${path}";`)
    .join("\n");

  const eventClassRegistry = `const eventClassRegistry: Record<string, unknown> = {
    ${events.map(({ eventName }) => `"${eventName}": ${eventName}`).join(",\n    ")}
};

export { eventClassRegistry };`;

  return `${imports}\n\n${eventClassRegistry}`;
}
  

async function updateEventRegistryFile(events: EventInfo[]): Promise<void> {
    
    const filePath = join(__dirname, '../../src/event/event-registry.ts');
    
    const code = generateCode(events);
  
    try {
      // Attempt to delete the file if it exists
      await fs.unlink(filePath);
      console.log('[OSWALD SCRIPT] Existing file deleted successfully.');
    } catch (error: any) {
      // If the file does not exist, log and continue
      if (error.code !== 'ENOENT') { // ENOENT = Error NO ENTry (i.e., file not found)
        console.error('Error deleting the file:', error);
        return;
      } else {
        console.log('File does not exist, creating a new one.');
      }
    }
  
    try {
      // Write the generated code to the file
      await fs.writeFile(filePath, code, 'utf8');
      console.log('[OSWALD SCRIPT] File written successfully with the generated code.');
    } catch (error) {
      console.error('Error writing the file:', error);
    }
  }
  

const main = async () => {
    const directoryToSearch = resolve('./'); // Adjust this path to the directory you want to search
    const pattern = /\.event\.ts$/; // Regex to match files ending with .event.ts

    const paths = await findFiles(directoryToSearch, pattern);
    const events = expandArrayWithFailedVariants(convertToCamelCase(paths));
    const final = events.map(ev => ({
      ...ev,
      path: `@turtleshell/${extractKeywordsAfterPackages(ev.path)}`
    }))

    
    await updateEventRegistryFile(final);
}


await main();