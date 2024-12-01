// App.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AddTaskCommand, TaskCommand } from "@/lib/command";
import { TaskFactory } from "@/lib/factory";
import { TaskList } from "./list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useTasks } from "@/context/tasks";
import { useEffect, useMemo, useState } from "react";
import { commands_subject } from "@/lib/observer";
import { Notifications } from "./notifications";
import { SortByCompletion, SortByTitle, TaskSorter } from "@/lib/strategy";
import { Separator } from "../ui/separator";
import { RiArrowGoBackLine } from "@remixicon/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(2).max(100),
});

export const App = () => {
  const { state, dispatch } = useTasks();
  const [sorter, setSorter] = useState<TaskSorter | undefined>();
  const [commands, setCommands] = useState<TaskCommand[]>([]);

  // Synchronisation avec localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(state));
  }, [state]);

  // Gestion des commandes
  useEffect(() => {
    const sub = commands_subject.subscribe((command) => {
      setCommands((prev) => [...prev, command]);
    });

    return () => sub.unsubscribe();
  }, [dispatch]);

  const undo: (() => void) | undefined = useMemo(() => {
    if (commands.length === 0) return;
    return () => {
      const command = commands.pop();
      if (command) {
        command.undo(dispatch);
        setCommands([...commands]);
      }
    };
  }, [commands, dispatch]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSorterChange = (value: string) => {
    switch (value) {
      case "title":
        setSorter(new TaskSorter(new SortByTitle()));
        break;
      case "completion":
        setSorter(new TaskSorter(new SortByCompletion()));
        break;
      default:
        setSorter(undefined);
        break;
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const task = TaskFactory.create(values.title, values.description);
    new AddTaskCommand(task).execute(dispatch);
    form.reset();
  };

  return (
    <>
      <main className="flex flex-col items-center justify-center w-screen h-screen bg-gray-50 p-8 overflow-hidden">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-8">
          My todo List
        </h1>

        <div className="flex flex-col md:flex-row gap-8 flex-1 w-full max-w-6xl bg-white rounded-xl shadow-lg p-6">
          {/* Section Form */}
          <div className="flex flex-col gap-6 w-full md:w-1/3 border-r border-gray-200 pr-6">
            <h2 className="text-xl font-semibold text-gray-800">Nouvelle tâche</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Titre
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Titre"
                          {...field}
                          className="border-gray-300 rounded-md shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Description"
                          {...field}
                          className="border-gray-300 rounded-md shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  Ajouter
                </Button>
              </form>
            </Form>
          </div>

          {/* Section Liste */}
          <div className="flex flex-col flex-1 gap-6">
            <div className="flex justify-between items-center">
              <Select onValueChange={onSorterChange}>
                <SelectTrigger className="w-[180px] border-gray-300">
                  <SelectValue placeholder="Trier les tâches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ne pas trier</SelectItem>
                  <SelectItem value="title">Ordre alphabétique</SelectItem>
                  <SelectItem value="completion">Statut de complétion</SelectItem>
                </SelectContent>
              </Select>

              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-gray-300 hover:border-gray-400"
                      onClick={undo}
                      disabled={!undo}
                    >
                      <RiArrowGoBackLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Annuler la dernière action</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <TaskList tasks={state} sorter={sorter} dispatch={dispatch} />
          </div>
        </div>
      </main>

      <Notifications />
    </>
  );
};
