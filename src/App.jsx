import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

function App() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showPrize, setShowPrize] = useState(false)
  const [prizeAmount, setPrizeAmount] = useState(0)
  const [fireworks, setFireworks] = useState([])
  const wheelRef = useRef(null)
  const spinTimeoutRef = useRef(null)
  const animationRef = useRef(null)
  const isSpinningRef = useRef(false)

  // 奖项配置：1-10元，概率分别是10/55到1/55
  const prizes = [
    { amount: 1, probability: 10, color: '#6befff' }, // 浅青蓝
    { amount: 2, probability: 9,  color: '#4ecdc4' }, // 青绿色
    { amount: 3, probability: 8,  color: '#45b7d1' }, // 蓝绿色
    { amount: 4, probability: 7,  color: '#96ceb4' }, // 浅绿
    { amount: 5, probability: 6,  color: '#ffe066' }, // 浅黄
    { amount: 6, probability: 5,  color: '#ff9ff3' }, // 粉色
    { amount: 7, probability: 4,  color: '#ff8c8c' }, // 浅红
    { amount: 8, probability: 3,  color: '#ff6b6b' }, // 红色
    { amount: 9, probability: 2,  color: '#ff4d4d' }, // 略深红
    { amount: 10, probability: 1, color: '#ff3333' }  // 不太深的红
  ]

  // 根据概率选择奖项
  const selectPrize = () => {
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)
    const random = Math.random() * totalProbability
    let currentSum = 0
    
    for (let i = 0; i < prizes.length; i++) {
      currentSum += prizes[i].probability
      if (random <= currentSum) {
        return i
      }
    }
    return 0
  }

  // 创建烟花效果
  const createFireworks = () => {
    const newFireworks = []
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3']
    
    for (let i = 0; i < 50; i++) {
      newFireworks.push({
        id: Math.random(),
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5 + 's'
      })
    }
    
    setFireworks(newFireworks)
    
    // 3秒后清除烟花
    setTimeout(() => {
      setFireworks([])
    }, 3000)
  }

  // 开始/停止转盘
  const handleSpin = () => {
    if (isSpinningRef.current) {
      // 停止转盘 - 开始减速过程
      isSpinningRef.current = false
      setIsSpinning(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // 选择奖项
      const selectedPrizeIndex = selectPrize()
      const selectedPrize = prizes[selectedPrizeIndex]
      
      // 计算最终角度
      // 指针在12点钟方向（0度），需要让选中的扇形区域指向指针
      const segmentAngle = 360 / prizes.length
      // 计算选中扇形的中心角度（相对于12点钟方向）
      const segmentCenterAngle = selectedPrizeIndex * segmentAngle + segmentAngle / 2
      
      // 由于指针在顶部，我们需要让转盘旋转，使得选中的扇形中心指向指针
      // 转盘需要逆时针旋转，让扇形中心对准指针
      // 调整角度计算，确保指针指向正确的扇形
      const targetAngle = 360 - segmentCenterAngle + 90 // 加上90度偏移来调整指针位置
      
      // 计算当前角度（取模360）
      const currentAngle = rotation % 360
      
      // 计算需要转动的角度，确保至少转3圈
      let angleDiff = targetAngle - currentAngle
      if (angleDiff <= 0) {
        angleDiff += 360
      }
      const finalRotation = rotation + (360 * 1) + angleDiff
      
      // 平滑减速动画
      let startRotation = rotation
      let targetRotation = finalRotation
      let startTime = Date.now()
      const duration = 2000 // 2秒减速时间
      
      const decelerate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用缓动函数实现平滑减速
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOut
        
        setRotation(currentRotation)
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(decelerate)
        } else {
          // 停止并显示结果
          setRotation(targetRotation)
          setTimeout(() => {
            setPrizeAmount(selectedPrize.amount-1?selectedPrize.amount-1:10)
            setShowPrize(true)
            createFireworks()
          }, 300)
        }
      }
      
      decelerate()
    } else {
      // 开始转盘 - 开始加速过程
      isSpinningRef.current = true
      setIsSpinning(true)
      setShowPrize(false)
      
      let currentSpeed = 2 // 初始速度
      let accelerating = true
      
      const spin = () => {
        if (accelerating && currentSpeed < 15) {
          // 加速阶段
          currentSpeed += 0.3
        } else {
          accelerating = false
        }
        
        setRotation(prev => prev + currentSpeed)
        
        // 只有在仍在旋转状态时才继续
        if (isSpinningRef.current) {
          animationRef.current = requestAnimationFrame(spin)
        }
      }
      
      spin()
    }
  }

  // 关闭中奖弹窗
  const closePrizeModal = () => {
    setShowPrize(false)
    setFireworks([])
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="lottery-container">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🎰 小猪兜请抽奖 🎰
        </h1>
        
        <div className="relative">
          {/* 指针 */}
          <div className="wheel-pointer"></div>
          
          {/* 转盘 */}
          <div 
            ref={wheelRef}
            className="lottery-wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((prize, index) => {
              const angle = (360 / prizes.length) * index
              return (
                <div
                  key={index}
                  className="wheel-segment"
                  style={{
                    backgroundColor: prize.color,
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div>
                    {prize.amount}元
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* 中心按钮 */}
          <button 
            className="center-button"
            onClick={handleSpin}
            disabled={showPrize}
          >
            {isSpinning ? '停止' : '开始'}
          </button>
        </div>
        
        <div className="text-white text-center des">
          <p className="text-lg mb-2">本周表现不错</p>
          <p className="text-sm opacity-80">获得一次抽取红包奖励的机会</p>
        </div>
      </div>

      {/* 烟花效果 */}
      {fireworks.length > 0 && (
        <div className="fireworks">
          {fireworks.map((firework) => (
            <div
              key={firework.id}
              className="firework"
              style={{
                left: firework.left,
                top: firework.top,
                backgroundColor: firework.color,
                animationDelay: firework.delay
              }}
            />
          ))}
        </div>
      )}

      {/* 中奖弹窗 */}
      {showPrize && (
        <div className="prize-modal" onClick={closePrizeModal}>
          <div className="prize-content" onClick={(e) => e.stopPropagation()}>
            <div className="red-envelope">🧧</div>
            <h2 className="text-2xl font-bold mb-4">恭喜获得本周奖励</h2>
            <div className="prize-amount">{prizeAmount}元！</div>
            <p className="text-lg mb-6">下周要继续努力哦！</p>
            <Button 
              onClick={closePrizeModal}
              className="bg-white text-red-500 hover:bg-gray-100 font-bold px-8 py-2"
            >
              亲妈妈一口领取
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

