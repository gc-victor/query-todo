import { Database } from "query:database";
import html from "./index.html";

interface Todo {
    id: number;
    name: string;
}

export async function handleRequest(_: Request) {
    const db = new Database("todo.sql");
    const result: Todo[] = db.query("SELECT * FROM todo");

    const tasksHtml = result.map(createTaskHtml).join("");
    const stylesUrl = getAssetUrl("dist/styles.css");
    const responseHtml = html.replace("{{ styles }}", stylesUrl).replace("{{ tasks }}", tasksHtml);

    return new Response(responseHtml, {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}

function createTaskHtml(task: Todo): string {
    return /*html*/ `
        <li class="flex items-center justify-between bg-slate-50 p-2 rounded">
            <form action="/" method="POST" class="flex items-center space-x-2 w-full">
                <span class="flex-grow text-slate-800">${task.name}</span>
                <input type="hidden" name="taskId" value="${task.id}">
                <button type="submit" class="text-sm text-red-500 hover:text-red-700">
                    Remove
                </button>
            </form>
        </li>
    `;
}

function getAssetUrl(fileName: string): string {
    const db = new Database("query_asset.sql");
    const result = db.query("SELECT name_hashed FROM asset WHERE name = ?", [fileName]) as { name_hashed: string }[];

    return `/_/asset/${result[0].name_hashed}`;
}
