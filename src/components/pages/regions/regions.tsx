import {
  type FC,
  type PropsWithChildren,
  type MouseEventHandler,
  useActionState,
  useState,
  useRef,
  useEffect
} from 'react'
import CardTemplate from '../../common/card/card'
import LoadingCard from '../../common/card/loading'
import TableTemplate from '~/components/common/table/table'
import ListTemplate from '~/components/common/table/list'
import { FormLabel } from '../../common/form/form'
import Image from '../../common/image/image'
import { Dialog, ScrollArea } from 'radix-ui'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef
} from '@tanstack/react-table'
import { useStore } from '@nanostores/react'
import { $regions, setRegions, type Region } from './store'
import { $accessLevels } from '../profile/store'
import { $showToast, setToastMessage } from '~/components/layout/toast/store'
import { actions, isInputError } from 'astro:actions'
import { clsx } from 'clsx/lite'
import CopyIcon from '~icons/lucide/copy'
import WhatsappIcon from '~icons/simple-icons/whatsapp'
import SaveIcon from '~icons/lucide/save'
import EditIcon from '~icons/lucide/pen'
import EnterIcon from '~icons/lucide/arrow-right'

const RegionsRC: FC = () => {
  return (
    <CardTemplate title='Daftar Kecamatan'>
      <RegionsTable />
    </CardTemplate>
  )
}

export default RegionsRC

const RegionsTable: FC = () => {
  const data = useStore($regions)

  if (!data) {
    return <LoadingCard />
  }

  const columnHelper = createColumnHelper<Region>()
  const desktopColumns = [
    columnHelper.accessor('name', {
      header: 'Kecamatan',
      cell: (cell) => cell.getValue()
    })
  ]

  const mobileColumns = [
    columnHelper.accessor('name', {
      cell: (cell) => <MobileListRow cell={cell} />
    })
  ]

  return (
    <RegionsTableRenderer
      desktopColumns={desktopColumns}
      mobileColumns={mobileColumns}
      data={data}
    />
  )
}

const RegionsTableRenderer: FC<{
  desktopColumns: Array<ColumnDef<Region, any>>
  mobileColumns: Array<ColumnDef<Region, any>>
  data: Array<Region>
}> = ({ desktopColumns, mobileColumns, data }) => {
  const desktopTable = useReactTable({
    columns: desktopColumns,
    data,
    getCoreRowModel: getCoreRowModel()
  })

  const mobileTable = useReactTable({
    columns: mobileColumns,
    data,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <ListTemplate list={mobileTable} className='-mx-4 md:hidden' />
      <TableTemplate
        table={desktopTable}
        className='table-auto max-md:hidden'
      />
      {/* <div className='mt-6 flex flex-col-reverse lg:flex-row-reverse'>
        <UserDialogBox>
          <UserDialog />
        </UserDialogBox>
      </div> */}
    </>
  )
}

// const UserDialog: FC = () => {
//   const ref = useRef<HTMLFormElement>(null)
//   const [formChanged, setFormChanged] = useState(false)

//   const updateUser = async (_: unknown, formData: FormData) => {
//     const { data, error } = await actions.user.create(formData)
//     if (error && !data) {
//       if (isInputError(error)) {
//         return error
//       }

//       setToastMessage({
//         error: true,
//         message: error.message
//       })
//       return undefined
//     }

//     setToastMessage({
//       message: 'Menyimpan perubahan...'
//     })
//     if (!showToast) {
//       const updatedUsersData = await actions.user.getAll.orThrow()
//       setAllUser(updatedUsersData)
//       setCreateMode(undefined)
//       setUser(undefined)
//       setFormChanged(false)
//     }
//     return undefined
//   }

//   const [error, submitAction, isPending] = useActionState(updateUser, undefined)

//   const handleFormChange = () => {
//     setFormChanged(true)
//   }

//   const handleReset: MouseEventHandler<HTMLButtonElement> = (e) => {
//     e.preventDefault()
//     ref.current?.reset()
//     setFormChanged(false)
//   }

//   const user = useStore($user)
//   const accessLevels = useStore($accessLevels)
//   const showToast = useStore($showToast)
//   const createMode = useStore($createMode)
//   const [isSelf, setIsSelf] = useState<boolean>(false)

//   const handleSelf = async () => {
//     const state = user
//       ? await actions.user.checks.isSelf.orThrow({
//           userName: user.userName
//         })
//       : false
//     setIsSelf(state)
//   }

//   useEffect(() => {
//     handleSelf()
//   }, [user])

//   if (!user) {
//     return <></>
//   }

//   const handleDelete: MouseEventHandler<HTMLButtonElement> = async (e) => {
//     e.preventDefault()
//     await actions.user.delete({ userName: user.userName }).then(async () => {
//       const updatedUsersData = await actions.user.getAll.orThrow()
//       setAllUser(updatedUsersData)
//       setCreateMode(undefined)
//       setUser(undefined)
//       setFormChanged(false)
//       setToastMessage({
//         message: 'Berhasil menghapus user.'
//       })
//     })
//   }

//   return (
//     <form action={submitAction} className='flex flex-col gap-4' ref={ref}>
//       <FormLabel label='Nama'>
//         <input
//           name='fullName'
//           className='input input-lg w-full'
//           type='text'
//           defaultValue={user.fullName}
//           disabled={isPending || showToast}
//           onChange={handleFormChange}
//         />
//         {error && error.fields.fullName && (
//           <span className='text-error'>
//             {error.fields.fullName.join(' | ')}
//           </span>
//         )}
//       </FormLabel>

//       <FormLabel label='Username'>
//         <input
//           name='userName'
//           className='input input-lg w-full'
//           type='text'
//           defaultValue={user.userName}
//           disabled={isPending || showToast || !createMode}
//         />
//         <span className='italic'>
//           Username bersifat permanen dan tidak dapat diganti.
//         </span>
//       </FormLabel>

//       {createMode && (
//         <>
//           <FormLabel label='Password'>
//             <input
//               name='password'
//               className='input input-lg w-full'
//               type='password'
//               disabled={isPending || showToast || !createMode}
//             />
//           </FormLabel>

//           <FormLabel label='Konfirmasi Password'>
//             <input
//               name='confirmPassword'
//               className='input input-lg w-full'
//               type='password'
//               disabled={isPending || showToast || !createMode}
//             />
//           </FormLabel>

//           <input type='hidden' name='createMode' value='true' />
//         </>
//       )}

//       <FormLabel label='Hak Akses'>
//         <select
//           name='accessLevel'
//           className='select select-lg w-full'
//           defaultValue={user.accessLevel}
//           disabled={isPending || showToast || !accessLevels}
//         >
//           {accessLevels ? (
//             accessLevels.map((lv) => (
//               <option value={lv.id} key={lv.id}>
//                 {lv.description}
//               </option>
//             ))
//           ) : (
//             <option selected disabled>
//               Mohon tunggu...
//             </option>
//           )}
//         </select>
//         <span className='italic'>
//           Hak akses hanya dapat diganti oleh Administrator.
//         </span>
//       </FormLabel>

//       <FormLabel label='Nomor Telepon'>
//         <input
//           name='phoneNumber'
//           className='input input-lg w-full'
//           type='text'
//           defaultValue={user.phoneNumber || ''}
//           disabled={isPending || showToast}
//           onChange={handleFormChange}
//         />
//         {error && error.fields.phoneNumber && (
//           <span className='text-error'>
//             {error.fields.phoneNumber.join(' | ')}
//           </span>
//         )}
//       </FormLabel>

//       <FormLabel label='Foto Profil'>
//         <div className='flex w-full flex-col items-center gap-4 md:flex-row'>
//           <div className='avatar'>
//             <div className='mask h-[120px] w-[120px] mask-circle md:h-[80px] md:w-[80px]'>
//               {user.profilePhoto && (
//                 <Image
//                   className='object-cover'
//                   src={user.profilePhoto}
//                   width={120}
//                   height={120}
//                 />
//               )}
//             </div>
//           </div>

//           <input
//             name='profilePhoto'
//             className='file-input file-input-lg flex-1'
//             type='file'
//             accept='image/*'
//             disabled={isPending || showToast}
//             onChange={handleFormChange}
//           />
//         </div>
//         {error && error.fields.profilePhoto && (
//           <span className='text-error'>
//             {error.fields.profilePhoto.join(' | ')}
//           </span>
//         )}
//       </FormLabel>

//       {!createMode && (
//         <input name='userName' type='hidden' value={user.userName} />
//       )}

//       <div className='mt-6 flex flex-col-reverse gap-4 md:mt-auto md:flex-row-reverse'>
//         <button
//           className='btn btn-primary flex items-center gap-2'
//           type='submit'
//           disabled={isPending || showToast || !formChanged}
//         >
//           <SaveIcon />
//           <span>Simpan</span>
//         </button>

//         <button
//           className='btn flex items-center gap-2'
//           disabled={isPending || showToast || !formChanged}
//           onClick={handleReset}
//         >
//           <span>Reset</span>
//         </button>

//         {createMode ? (
//           <button
//             className='btn flex items-center gap-2 lg:mr-auto'
//             disabled={isPending || showToast}
//             onClick={() => {
//               setCreateMode(undefined)
//               setUser(undefined)
//             }}
//           >
//             <span>Batalkan</span>
//           </button>
//         ) : (
//           <button
//             className='btn btn-link btn-error dark:btn-neutral flex items-center gap-2 lg:mr-auto'
//             disabled={isPending || showToast || isSelf}
//             onClick={handleDelete}
//           >
//             <span>Hapus</span>
//           </button>
//         )}
//       </div>
//     </form>
//   )
// }

// const UserDialogBox: FC<PropsWithChildren> = ({ children }) => {
//   const openDialog = useStore($openDialog)
//   const createMode = useStore($createMode)

//   const handleDialog = () => {
//     if (!openDialog) {
//       setCreateMode(true)
//       setUser({
//         userId: '',
//         fullName: '',
//         userName: '',
//         accessLevel: 1,
//         phoneNumber: null,
//         profilePhoto: null
//       })
//     } else {
//       setCreateMode(undefined)
//       setUser(undefined)
//     }
//   }

//   return (
//     <Dialog.Root open={openDialog} onOpenChange={handleDialog}>
//       <Dialog.Trigger asChild>
//         <button className='btn btn-primary'>
//           <span>Tambah Pengguna</span>
//         </button>
//       </Dialog.Trigger>
//       <Dialog.Portal>
//         <Dialog.Overlay className='bg-neutral/20 fixed inset-0 z-[998] cursor-pointer'></Dialog.Overlay>
//         <Dialog.Content className='bg-base-100 card lg:card-lg fixed top-[10%] z-[999] h-[90vh] w-screen md:top-[50%] md:left-[50%] md:w-[80vw] md:translate-[-50%] md:shadow lg:w-[60vw]'>
//           <ScrollArea.Root className='card-body max-h-full max-md:pb-0'>
//             <ScrollArea.Viewport className='h-full px-1 pb-12'>
//               <Dialog.Title className='card-title mb-6'>
//                 {createMode ? 'Tambah Pengguna' : 'Edit Pengguna'}
//               </Dialog.Title>
//               {children}
//             </ScrollArea.Viewport>
//             <ScrollArea.Scrollbar>
//               <ScrollArea.Thumb></ScrollArea.Thumb>
//             </ScrollArea.Scrollbar>
//           </ScrollArea.Root>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog.Root>
//   )
// }

// const TableFullNameCell: FC<{ cell: CellContext<User, string> }> = ({
//   cell
// }) => {
//   const name = cell.getValue()
//   const handleSetUser = () => {
//     setUser(cell.row.original)
//   }
//   return (
//     <div className='flex items-center gap-2'>
//       <div
//         className={clsx(
//           'avatar',
//           !cell.row.original.profilePhoto && 'avatar-placeholder'
//         )}
//       >
//         <div className='mask bg-secondary h-[25px] w-[25px] mask-circle'>
//           {cell.row.original.profilePhoto ? (
//             <Image
//               src={cell.row.original.profilePhoto}
//               width={25}
//               height={25}
//             />
//           ) : (
//             <span className='text-secondary-content text-xs uppercase'>
//               {name.slice(0, 2)}
//             </span>
//           )}
//         </div>
//       </div>

//       <span
//         className='btn btn-link pl-0 text-left'
//         role='button'
//         onClick={handleSetUser}
//       >
//         {name}
//       </span>
//     </div>
//   )
// }

// const TableAccessLevelCell: FC<{ cell: CellContext<User, number> }> = ({
//   cell
// }) => {
//   const accessLevels = useStore($accessLevels)
//   if (!accessLevels) {
//     return null
//   }

//   return (
//     <span className='badge badge-outline badge-primary badge-sm rounded-full font-mono uppercase'>
//       {accessLevels.find((l) => l.id === cell.getValue())?.description}
//     </span>
//   )
// }

// const TablePhoneNumCell: FC<{ cell: CellContext<User, string | null> }> = ({
//   cell
// }) => {
//   const phoneNumber = cell.getValue()

//   const handleCopy = () => {
//     navigator.clipboard.writeText(phoneNumber || '')
//     setToastMessage({ message: 'Nomor telepon sudah dicopy!' })
//   }

//   const handleWhatsApp = () => {
//     if (phoneNumber) {
//       let whatsAppNumber
//       if (phoneNumber.startsWith('0')) {
//         whatsAppNumber = '62' + phoneNumber.slice(1)
//       }
//       const whatsappUrl = `https://wa.me/${whatsAppNumber}`
//       window.open(whatsappUrl, '_blank')
//     }
//   }

//   return (
//     <div className='flex items-center gap-1'>
//       <span>{phoneNumber}</span>
//       <span className='btn btn-ghost btn-xs' role='button' onClick={handleCopy}>
//         <CopyIcon />
//       </span>
//       <span
//         className='btn btn-ghost btn-xs'
//         role='button'
//         onClick={handleWhatsApp}
//       >
//         <WhatsappIcon />
//       </span>
//     </div>
//   )
// }

const MobileListRow: FC<{ cell: CellContext<Region, string | null> }> = ({
  cell
}) => {
  return (
    <>
      <div className='list-col-grow flex flex-col justify-center'>
        <span className='font-bold'>{cell.getValue()}</span>
      </div>
      <div>
        <button className='btn btn-sm btn-square btn-ghost'>
          <EditIcon />
        </button>
      </div>
      <div>
        <button className='btn btn-sm btn-square btn-ghost'>
          <EnterIcon />
        </button>
      </div>
    </>
  )
}
