/**
 * @fileoverview Mobile List Component for Menu Settings
 *
 * This component provides a mobile-optimized list view for displaying menu settings data
 * within the SILARAS platform. It renders daily assessment menu configuration in a
 * card-based layout suitable for mobile devices with inline editing capabilities.
 *
 * Key Features:
 * - Mobile-optimized card layout for menu settings
 * - Inline menu editing with form integration
 * - Daily assessment menu configuration display
 * - Calendar-based menu organization
 * - Real-time menu data synchronization
 *
 * Menu Display Elements:
 * - Daily menu item names and descriptions
 * - Calendar date indicators for menu planning
 * - Inline form editing for menu modifications
 * - Assessment-specific menu requirements
 *
 * Interactive Features:
 * - Inline editing with MenuForm integration
 * - Real-time form validation and updates
 * - Mobile-friendly touch interactions
 *
 * @module Components/Settings/Menu
 * @author SNGR Creative
 * @since 1.0.0
 */
// filepath: /workspaces/project-dashat/src/components/settings/menu/mobile-list.tsx

import { type FC } from 'react'
import { type CellContext } from '@tanstack/react-table'
import { type DailyAssesmentsSettings } from './menu.store'
import MenuForm from './menu-form'
import CalendarIcon from '~icons/lucide/calendar'

interface MobileListProps {
  cell: CellContext<DailyAssesmentsSettings[number], unknown>
}

const MobileList: FC<MobileListProps> = ({ cell }) => {
  return (
    <div className='border-base-300 bg-base-100 rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md'>
      <div className='flex flex-col gap-y-3'>
        {/* Date Header */}
        <div className='border-base-300 flex items-center gap-2 border-b pb-2'>
          <CalendarIcon className='text-primary h-4 w-4' />
          <h3 className='text-base-content text-base font-semibold'>
            {cell.row.original.date?.toLocaleDateString('id-ID', {
              dateStyle: 'full'
            })}
          </h3>
        </div>

        {/* Menu Form */}
        <MenuForm cell={cell} key={cell.row.original.id} />
      </div>
    </div>
  )
}

export default MobileList
