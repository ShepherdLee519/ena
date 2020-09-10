library(rENA, warn.conflicts=F)
library(htmltools, warn.conflicts=F)
library(plotly, warn.conflicts=F)
library(dplyr, warn.conflicts=F)

# 读入xlsx编码结果数据
STEM.data = read.csv("C:\\wamp64\\www\\ena\\xlsx\\encode.csv", 1)

# 确定分析单位
units = STEM.data[,c("classID","gpID","userName")]

# 确定会话
conversation = as.data.frame(STEM.data[,c("classID","gpID")])

# 确定讨论内容的编码方案
codeCols = c("analysis","objective","context","knowledge","activity","technology","evaluation")
codes = STEM.data[,codeCols]

# 计算累计邻接向量，定义节的大小是5行
accum = ena.accumulate.data(units = units,conversation = conversation,codes = codes,window.size.back = 5)

# 计算绘制网络图的相关参数
set = ena.make.set(enadata = accum)

# 绘制各个分析单位的质心
target1.points = as.matrix(set$points[classID=='1'])
target2.points = as.matrix(set$points[classID=='2'])
center1.points = as.matrix(set$points[classID=='1'])
center2.points = as.matrix(set$points[classID=='2'])

enaplot = ena.plot(set, font.size=15, scale.to = "points", title = "Title")  %>%
  ena.plot.group(point = target1.points, colors = c("#4bacc6"), confidence.interval = "box") %>%
  ena.plot.group(point = target2.points, colors = c("#f79646"), confidence.interval = "box") %>%
  ena.plot.points(points = center1.points, colors = c("#4bacc6")) %>%
  ena.plot.points(points = center2.points, colors = c("#f79646")) 


setwd("../output")
htmlwidgets::saveWidget(enaplot$plot, file="./output.html")
