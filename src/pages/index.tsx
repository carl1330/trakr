import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import {FaRegPlusSquare, FaChartBar, FaUser, FaSignOutAlt, FaSignInAlt, FaCheck, FaPen} from "react-icons/fa"
import Link from "next/link";
import { CircularProgress, Tooltip } from "@mui/material";
import { Menu } from "@headlessui/react";
import Image from "next/image";
import { Dialog } from '@headlessui/react'
import { useState } from "react";
import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { api, RouterOutputs } from "~/utils/api";
import { MdDelete } from "react-icons/md";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center flex-col">
        <Navbar />
        {sessionData ? <HabitFeed /> : ""}
      </main>
    </>
  );
};

export default Home;

const Navbar: React.FC = () => { 
  const { data: sessionData } = useSession();


  const UserMenu = () => {
    if(!sessionData) return <CircularProgress />;

    return (
      <Menu>
        <Menu.Button className="hover:opacity-90 transition-all">
          <Image className="rounded-full" width={30} height={30} src={sessionData.user.image as string} alt={`${sessionData.user.name as string}'s profile picture`}></Image>
        </Menu.Button>
        <Menu.Items className="absolute flex flex-col mt-32 shadow-md rounded right-10 bg-white">
          <button>
            <div className="flex flex-row items-center gap-2 p-2 px-4 hover:bg-zinc-300 transition-all">
              <FaUser />
              <p>Account</p>
            </div>
          </button>
          <button onClick={() => void signOut()}>
            <div className="flex flex-row items-center gap-2 p-2 px-4 hover:bg-zinc-300 transition-all">
              <FaSignOutAlt />
              <p>Sign out</p>
            </div>
          </button>
        </Menu.Items>
      </Menu>
    )
  }

  const UserOptions = () => {
    return (
      <div className="flex flex-row items-center gap-6">
        <HabitModal />
        <Link href={"/stats"} className="p-2 rounded hover:bg-zinc-300 transition-all">
          <FaChartBar />
        </Link>
        <UserMenu />
      </div>
    )
  }

  return (
    <div className="flex flex-row justify-between h-16 items-center px-4">
      <div className="font-bold">
        trakr.
      </div>
      {sessionData ? <UserOptions /> : <button className="flex flex-row items-center gap-2 rounded p-2 hover:bg-zinc-300 transition-all" onClick={() => void signIn()}><FaSignInAlt /> Sign in</button>}
    </div>
  )
};

const HabitFeed: React.FC = () => {
  const { data: habits, isLoading } = api.habit.getHabits.useQuery();

  if(isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen -mt-16">
      <CircularProgress color="secondary"/>
    </div>
  )

  if(habits?.length == 0) 
    return (
      <div className="flex flex-col items-center justify-center h-screen -mt-16">
        <p className="text-zinc-400 text-lg">You don&apos;t have any habits yet. Create one!</p>
        <HabitModal />
      </div>
    )

  type HabitFull = RouterOutputs["habit"]["getHabits"][0]
  const Habit = (props: {habit: HabitFull}) => {
    const ctx = api.useContext();
    const { mutate: deleteHabit, isLoading } = api.habit.deleteHabit.useMutation({
      onSuccess: () => {
        void ctx.habit.getHabits.invalidate();
      }
    });
    const boxes = []
    const habitStartDate = new Date(props.habit.createdAt);
    for (let i = 0; i < 365; i++) {
      const boxdate = new Date(habitStartDate.getTime() + (24 * 60 * 60 * 1000) * i).toISOString().substring(0,10)
      boxes[i] = (
        <Tooltip title={boxdate} disableInteractive>
          <div className="w-[12px] h-[12px] bg-zinc-200 hover:bg-zinc-400 hover:cursor-pointer overflow-hidden" />
        </Tooltip>
      );
    }

    return (
      <div className="flex flex-col shadow-md">
        <div className="flex flex-col gap-2 h-1/2 bg-violet-500 p-2 rounded-t">
          <div className="flex flex-row justify-between">
            <div>
              <p className="text-xl font-bold text-violet-50">{props.habit.name}</p>
              <p className="text-violet-300">{props.habit.description}</p>
            </div>
            {!isLoading ?
            <button onClick={() => deleteHabit(props.habit.id)} className="self-start text-violet-900 hover:bg-violet-600 p-2 rounded">
              <MdDelete />
            </button> :
            <CircularProgress size={20} color="secondary"/>
            }
          </div>
          <div className="text-violet-50 flex flex-row gap-6">
            <button className="p-2 rounded hover:bg-violet-600 transition-all">
              <FaCheck />
            </button>
            <button className="p-2 rounded hover:bg-violet-600 transition-all">
              <FaPen />
            </button>
          </div>
        </div>
        <div className="p-2 rounded-b">
          <div className="grid gap-[4px] grid-rows-6 grid-flow-col">
            {boxes}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
        {habits?.map((habit) => (
          <Habit habit={habit} key={habit.id} />
        ))}
    </div>
  )
}

const HabitModal: React.FC = () => {
  const ctx = api.useContext();
  const [isOpen, setIsOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const {mutate: habit, isLoading} = api.habit.createHabit.useMutation({
    onSuccess: () => {
      void ctx.habit.getHabits.invalidate();
      setIsOpen(false);
    }
  });

  function createHabit() {
    habit({
      name: habitName,
      description: habitDescription
    })
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 rounded hover:bg-zinc-300 transition-all">
        <FaRegPlusSquare />
      </button>


      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
           <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create new habit
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Habit name
                    </p>
                    <input onChange={(e) => setHabitName(e.target.value)} className="outline-none" placeholder="An awesome habit!" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Habit description
                    </p>
                    <textarea onChange={(e) => setHabitDescription(e.target.value)} draggable={false} className="outline-none w-full h-24 resize-none" placeholder="An awesome habit!" />
                  </div>
                  <div className="mt-4">
                    {!isLoading ?
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-violet-800 px-4 py-2 text-sm font-medium text-white hover:bg-violet-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                      onClick={() => {createHabit()}}
                    >
                      Create
                    </button> :
                    <div className="inline-flex justify-center rounded-md border border-transparent bg-violet-800 px-4 py-2 text-sm font-medium text-white hover:bg-violet-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
                      <CircularProgress color="inherit" size={20}/>
                    </div> }
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>

  )
}

