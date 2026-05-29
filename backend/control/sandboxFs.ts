import path from 'path';
import fs from 'fs/promises';

// The UI refers to C:\LucySandbox, but locally on the container we map to ./LucySandbox
export const UI_VIRTUAL_PREFIX = 'C:\\LucySandbox';
export const SANDBOX_ROOT = path.resolve(process.cwd(), 'LucySandbox');

/**
 * Ensures any path requested is strictly bound within the sandbox folder.
 */
export function safePath(relPath: string) {
    let cleanPath = relPath;
    
    // Normalize if the UI is sending the virtual path mapping
    if (cleanPath.startsWith(UI_VIRTUAL_PREFIX)) {
        cleanPath = cleanPath.substring(UI_VIRTUAL_PREFIX.length);
    }
    
    // Strip leading slashes to prevent absolute path escapes
    cleanPath = cleanPath.replace(/^[\\\/]+/, '');
    
    const absolutePath = path.resolve(SANDBOX_ROOT, cleanPath);
    
    if (!absolutePath.startsWith(SANDBOX_ROOT)) {
        throw new Error(`[SECURITY] Sandbox escape blocked. Attempted to access: ${absolutePath}`);
    }
    
    return absolutePath;
}

export async function listDir(relPath: string = '') {
    const target = safePath(relPath);
    try {
        const items = await fs.readdir(target, { withFileTypes: true });
        return items.map(entry => ({
            name: entry.name,
            isDir: entry.isDirectory(),
            relPath: (relPath ? relPath + '\\' : '') + entry.name // Send back DOS-style relative paths for UI
        }));
    } catch (e: any) {
        if (e.code === 'ENOENT') return [];
        throw e;
    }
}

export async function createFile(relPath: string, content: string = '') {
    const target = safePath(relPath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, 'utf8');
}

export async function renamePath(oldRelPath: string, newRelPath: string) {
    const oldTarget = safePath(oldRelPath);
    const newTarget = safePath(newRelPath);
    await fs.rename(oldTarget, newTarget);
}

export async function deletePath(relPath: string) {
    const target = safePath(relPath);
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
        await fs.rm(target, { recursive: true, force: true });
    } else {
        await fs.unlink(target);
    }
}

export async function openPath(relPath: string = '') {
    const target = safePath(relPath);
    console.log(`[sandboxFs] OS OVERRIDE - Opening physical path: ${target}`);
    // In actual Electron: await shell.openPath(target);
    return target;
}
