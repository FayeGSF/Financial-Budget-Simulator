// only show 3 tips at a time
// if user dismiss, record the tips id and show the next one. 
// require 2 states, 1 for the read state and 1 for dismissed state 
// if user clicks "read" the tip will go to the end of the list, tip will still be is_active: 1

import React, { useState } from 'react'
import axios from 'axios';
import TipIcons from './TipIcons'

export default function Tips({ tips, isLoading }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const [dismissedTips, setDismissedTips] = useState(new Set());
    const [readTips, setReadTips] = useState(new Set());
    // if more than  3 tips use showAll state
    const [showAll, setShowAll] = useState (null)
 
    // Get active tips, sort unread and only ones where is_active =1
    const activeTips = (tips || []).filter(tip => 
        (tip.is_active === true || tip.is_active === 1) && 
        !dismissedTips.has(tip.tip_id)
    );
    
    // Separate unread and read tips
    const unreadTips = activeTips.filter(tip => !readTips.has(tip.tip_id));
    const readTipsList = activeTips.filter(tip => readTips.has(tip.tip_id));
    
    // Show unread tips first, then read tips if no unread tips available
    const tipsToShow = unreadTips.length > 0 ? unreadTips : readTipsList;

    const handleAction = async (tip_id, action) => {
        try {
            await axios.post(`${apiBaseUrl}/api/tips/interact`, {
                tip_id,
                action
            }, { withCredentials: true });
            
            if (action === 'dismissed') {
                // Immediately remove the tip from display, add the tip_id into the dissmissed set
                setDismissedTips(prev => new Set([...prev, tip_id]));
            } else {
                  // For 'read' action, just move to next tip until the list is exhausted
                setReadTips(prev => new Set([...prev, tip_id]));
            }
        } catch (error) {
            console.error('Error saving tip interaction:', error);
        }
    }

    const hasMoreTips = tipsToShow.length > 3

    // Show "No more tips for today" when all tips are read or no active tips
    if (tipsToShow.length === 0 || (unreadTips.length === 0 && readTipsList.length > 0)) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-700">No more tips for today</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {(showAll ? tipsToShow : tipsToShow.slice(0, 3)).map((tip) => (
                <div key={tip.tip_id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <TipIcons tipType={tip.tip_type} priority={tip.priority} />
                        <h4 className="font-semibold text-gray-800">{tip.title}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{tip.message}</p>
                    {tip.actionable_advice && (
                        <p className="text-sm text-blue-700 mt-1 italic">{tip.actionable_advice}</p>
                    )}
                    <div className="flex gap-4 mt-3">
                        <button 
                            onClick={() => handleAction(tip.tip_id, 'read')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                            ✓ Read
                        </button>
                        <button 
                            onClick={() => handleAction(tip.tip_id, 'dismissed')}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                        >
                            ✗ Dismiss
                        </button>
                    </div>
                </div>
            ))}
            {/* Show More Tips button */}
            {hasMoreTips && (
                <div className =" text-center ">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm 
                        transition-colors"
                        >
                        {showAll ? 'Show Less' : `Show ${tipsToShow.length - 2} More`}
                        </button>
                </div>
            )}
        </div>
    );
}
