import React from 'react';
import { FaExclamationTriangle, FaLightbulb,FaChartBar,FaEye,FaMoneyBillWave,
  FaCalendarAlt,FaCoins,FaQuestionCircle} from 'react-icons/fa';
import { LuPartyPopper } from "react-icons/lu";
import { TbTargetArrow } from "react-icons/tb";



export default function TipIcons ({ tipType, priority }) {
    const icon =() => {
        if (priority === 'urgent') {
            return <FaExclamationTriangle className="text-red-500" />;
          }
          
          if (priority === 'congratulation') {
            return <LuPartyPopper className="text-yellow-500" />;
          }
          
          switch (tipType) {
            case 'income_expense':
              return <FaMoneyBillWave className="text-green-500" />;
            case 'savings_progress':
              return <TbTargetArrow className="text-orange-500" />;
            case 'category_analysis':
              return <FaChartBar className="text-purple-500" />;
            case 'weekend_spending':
              return <FaCalendarAlt className="text-orange-500" />;
            case 'large_one_time_expense':
              return <FaMoneyBillWave className="text-red-500" />;
            case 'general_tip':
              return <FaLightbulb className="text-yellow-500" />;
            default:
              return <FaQuestionCircle className="text-gray-500" />;
          }
        };
      
        return (
          <span className="inline-flex items-center mr-2 text-lg">
            {icon()}
          </span>
        );
      };
