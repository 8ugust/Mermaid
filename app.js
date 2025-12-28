// Mermaid 초기화
mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#a78bfa',
        primaryTextColor: '#0f172a',
        primaryBorderColor: '#8b5cf6',
        lineColor: '#a78bfa',
        secondaryColor: '#c4b5fd',
        tertiaryColor: '#ddd6fe',
        background: 'transparent',
        mainBkg: '#a78bfa',
        secondBkg: '#c4b5fd',
        tertiaryBkg: '#ddd6fe',
        textColor: '#0f172a',
        secondaryTextColor: '#1e293b',
        tertiaryTextColor: '#334155',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        nodeBkg: '#a78bfa',
        nodeBorder: '#8b5cf6',
        clusterBkg: '#c4b5fd',
        clusterBorder: '#a78bfa',
        defaultLinkColor: '#a78bfa',
        titleColor: '#0f172a',
        edgeLabelBackground: '#ddd6fe',
        actorBorder: '#8b5cf6',
        actorBkg: '#a78bfa',
        actorTextColor: '#0f172a',
        actorLineColor: '#8b5cf6',
        signalColor: '#0f172a',
        signalTextColor: '#0f172a',
        labelBoxBkgColor: '#c4b5fd',
        labelBoxBorderColor: '#8b5cf6',
        labelTextColor: '#0f172a',
        loopTextColor: '#0f172a',
        noteBorderColor: '#8b5cf6',
        noteBkgColor: '#ddd6fe',
        noteTextColor: '#0f172a',
        activationBorderColor: '#8b5cf6',
        activationBkgColor: '#c4b5fd',
        sequenceNumberColor: '#0f172a',
        sectionBkgColor: '#c4b5fd',
        altSectionBkgColor: '#ddd6fe',
        sectionBkgColor2: '#a78bfa',
        excludeBkgColor: '#c4b5fd',
        taskBorderColor: '#8b5cf6',
        taskBkgColor: '#a78bfa',
        taskTextLightColor: '#0f172a',
        taskTextColor: '#0f172a',
        taskTextDarkColor: '#0f172a',
        taskTextOutsideColor: '#a78bfa',
        taskTextClickableColor: '#0f172a',
        activeTaskBorderColor: '#8b5cf6',
        activeTaskBkgColor: '#c4b5fd',
        gridColor: '#a78bfa',
        doneTaskBkgColor: '#ddd6fe',
        doneTaskBorderColor: '#8b5cf6',
        critBorderColor: '#8b5cf6',
        critBkgColor: '#c4b5fd',
        taskTextLineColor: '#0f172a',
        todayLineColor: '#a78bfa',
        labelColor: '#0f172a'
    },
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20
    }
});

// 패닝 기능 구현
class PanZoomController {
    constructor(container, wrapper) {
        this.container = container;
        this.wrapper = wrapper;
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.initialPanX = 0;
        this.initialPanY = 0;
        this.initialScale = 1;
        this.initialPanXValue = 0;
        this.initialPanYValue = 0;
        this.zoomPercentageElement = document.getElementById('zoomPercentage');
        
        this.init();
    }
    
    init() {
        // 마우스 이벤트
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.container.addEventListener('mouseleave', this.onMouseUp.bind(this));
        
        // 커서 관리를 위한 mousemove 이벤트
        this.container.addEventListener('mousemove', (e) => {
            this.updateCursor(e);
        });
        
        // 휠 이벤트
        this.container.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        
        this.updateTransform();
    }
    
    updateCursor(e) {
        // procs 노드 위에 있는지 확인
        const target = e.target;
        let isProcsNode = false;
        
        let currentElement = target;
        while (currentElement && currentElement !== this.container) {
            if (currentElement.tagName === 'g' || currentElement.closest('g')) {
                const gElement = currentElement.tagName === 'g' ? currentElement : currentElement.closest('g');
                if (gElement && gElement.dataset.hasHandlers === 'true') {
                    isProcsNode = true;
                    break;
                }
            }
            currentElement = currentElement.parentElement;
        }
        
        // procs 노드 위에 있으면 pointer, 아니면 grab
        if (isProcsNode) {
            this.container.style.cursor = 'pointer';
            document.body.style.cursor = 'pointer';
        } else {
            if (!this.isDragging) {
                this.container.style.cursor = 'grab';
                document.body.style.cursor = '';
            }
        }
    }
    
    onMouseDown(e) {
        if (e.button === 0) { // 좌클릭만
            // procs 노드인지 확인 (클릭된 요소가 procs 노드나 그 자식인지)
            const target = e.target;
            let isProcsNode = false;
            
            // 클릭된 요소가 procs 노드 내부인지 확인
            let currentElement = target;
            while (currentElement && currentElement !== this.container) {
                if (currentElement.tagName === 'g' || currentElement.closest('g')) {
                    const gElement = currentElement.tagName === 'g' ? currentElement : currentElement.closest('g');
                    if (gElement && gElement.dataset.hasHandlers === 'true') {
                        isProcsNode = true;
                        break;
                    }
                }
                currentElement = currentElement.parentElement;
            }
            
            // procs 노드가 아니면 드래그 시작
            if (!isProcsNode) {
                this.isDragging = true;
                this.startX = e.clientX - this.panX;
                this.startY = e.clientY - this.panY;
                this.initialPanX = this.panX;
                this.initialPanY = this.panY;
                this.container.classList.add('dragging');
                e.preventDefault();
            }
        }
    }
    
    onMouseMove(e) {
        if (this.isDragging) {
            this.panX = e.clientX - this.startX;
            this.panY = e.clientY - this.startY;
            this.updateTransform();
        }
    }
    
    onMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.container.classList.remove('dragging');
        }
    }
    
    onWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(3, this.scale * delta));
        
        // 마우스 위치를 기준으로 확대/축소
        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleChange = newScale / this.scale;
        this.panX = mouseX - (mouseX - this.panX) * scaleChange;
        this.panY = mouseY - (mouseY - this.panY) * scaleChange;
        
        this.scale = newScale;
        this.updateTransform();
    }
    

    
    updateTransform() {
        const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        console.log('[PanZoomController.updateTransform]', {
            panX: this.panX,
            panY: this.panY,
            scale: this.scale,
            transform: transform,
            timestamp: new Date().toISOString()
        });
        this.wrapper.style.transform = transform;
        this.updateZoomPercentage();
    }
    
    updateZoomPercentage() {
        if (this.zoomPercentageElement) {
            const percentage = Math.round(this.scale * 100);
            this.zoomPercentageElement.textContent = `${percentage}%`;
        }
    }
    
    setInitialView(scale, panX, panY) {
        this.initialScale = scale;
        this.initialPanXValue = panX;
        this.initialPanYValue = panY;
    }
    
    resetToInitialView() {
        this.scale = this.initialScale;
        this.panX = this.initialPanXValue;
        this.panY = this.initialPanYValue;
        this.updateTransform();
    }
    
    reset() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
    }
}

// 검색 기능
class NodeSearch {
    constructor() {
        this.searchInput = document.getElementById('nodeSearch');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsContainer = document.getElementById('searchResults');
        this.nodes = [];
        
        this.init();
    }
    
    init() {
        // Mermaid 렌더링 완료 후 노드 정보 수집
        setTimeout(() => {
            this.collectNodes();
        }, 2000);
        
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }
    
    collectNodes() {
        const wrapper = document.getElementById('mermaidWrapper');
        if (!wrapper) return;
        
        // 모든 SVG 요소에서 노드 이름 추출
        const svgs = wrapper.querySelectorAll('svg');
        const nodeMap = new Map();
        
        svgs.forEach(svg => {
            const textElements = svg.querySelectorAll('p');
            textElements.forEach(p => {
                const nodeName = p.textContent.trim();
                if (nodeName && !nodeMap.has(nodeName)) {
                    // 노드의 위치 정보도 함께 저장
                    const rect = p.getBoundingClientRect();
                    const parent = p.closest('g');
                    if (parent) {
                        nodeMap.set(nodeName, {
                            name: nodeName,
                            element: parent,
                            svg: svg,
                            x: rect.left,
                            y: rect.top
                        });
                    }
                }
            });
        });
        
        this.nodes = Array.from(nodeMap.values());
        console.log('[NodeSearch] 수집된 노드 수:', this.nodes.length);
    }
    
    performSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        
        if (!query) {
            this.clearResults();
            // 검색 입력이 비어있을 때 줌 리셋 버튼과 동일한 효과
            if (panZoomController) {
                panZoomController.resetToInitialView();
            }
            return;
        }
        
        const results = this.nodes.filter(node => 
            node.name.toLowerCase().includes(query)
        );
        
        this.displayResults(results, query);
        this.highlightNodes(results);
    }
    
    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    "${query}"에 해당하는 노드를 찾을 수 없습니다.
                </div>
            `;
            return;
        }
        
        this.resultsContainer.innerHTML = results.map(node => `
            <div class="result-item" data-node="${node.name}">
                <div class="node-name">${this.highlightText(node.name, query)}</div>
            </div>
        `).join('');
        
        // 결과 항목 클릭 이벤트
        this.resultsContainer.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                const nodeName = item.dataset.node;
                const node = this.nodes.find(n => n.name === nodeName);
                if (node) {
                    this.scrollToNode(node);
                }
            });
        });
    }
    
    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: #fbbf24; color: #0f172a; padding: 2px 4px; border-radius: 4px; font-weight: 600;">$1</mark>');
    }
    
    highlightNodes(results) {
        const wrapper = document.getElementById('mermaidWrapper');
        if (!wrapper) return;
        
        // 검색된 노드가 포함된 SVG 찾기
        const matchedSvgs = new Set();
        results.forEach(result => {
            if (result.svg) {
                matchedSvgs.add(result.svg);
            }
        });
        
        const mermaidGrid = wrapper.querySelector('.mermaid-grid');
        if (!mermaidGrid) return;
        
        // 모든 플로우차트 컨테이너 찾기
        const flowchartContainers = mermaidGrid.querySelectorAll('.mermaid');
        
        flowchartContainers.forEach(container => {
            const svg = container.querySelector('svg');
            if (!svg) return;
            
            const isMatched = matchedSvgs.has(svg);
            
            if (isMatched) {
                // 검색된 노드가 있는 플로우차트는 보이게
                container.style.opacity = '1';
                container.style.transition = 'opacity 0.3s ease';
                svg.style.opacity = '1';
                svg.style.transition = 'opacity 0.3s ease';
                
                // 검색된 노드에 하이라이트 효과
                results.forEach(result => {
                    if (result.svg === svg && result.element) {
                        result.element.style.opacity = '1';
                        result.element.style.filter = 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.8))';
                    }
                });
            } else {
                // 검색된 노드가 없는 플로우차트는 투명하게
                container.style.opacity = '0.2';
                container.style.transition = 'opacity 0.3s ease';
                svg.style.opacity = '0.2';
                svg.style.transition = 'opacity 0.3s ease';
            }
        });
    }
    
    scrollToNode(node) {
        // 노드로 이동 (패닝 컨트롤러를 통해)
        if (node.element && node.svg && panZoomController) {
            const svgRect = node.svg.getBoundingClientRect();
            const nodeRect = node.element.getBoundingClientRect();
            
            const containerRect = document.getElementById('canvasContainer').getBoundingClientRect();
            
            // 노드를 화면 중앙으로 이동
            const targetX = containerRect.width / 2 - (nodeRect.left - svgRect.left + nodeRect.width / 2);
            const targetY = containerRect.height / 2 - (nodeRect.top - svgRect.top + nodeRect.height / 2);
            
            panZoomController.panX = targetX;
            panZoomController.panY = targetY;
            panZoomController.updateTransform();
        }
    }
    
    clearResults() {
        this.resultsContainer.innerHTML = '';
        
        // 모든 플로우차트와 노드의 하이라이트 제거
        const wrapper = document.getElementById('mermaidWrapper');
        if (!wrapper) return;
        
        const svgs = wrapper.querySelectorAll('svg');
        const mermaidGrid = wrapper.querySelector('.mermaid-grid');
        const flowchartContainers = mermaidGrid ? mermaidGrid.querySelectorAll('.mermaid') : [];
        
        svgs.forEach(svg => {
            svg.style.opacity = '1';
            svg.querySelectorAll('g').forEach(g => {
                g.style.opacity = '1';
                g.style.filter = 'none';
            });
        });
        
        flowchartContainers.forEach(container => {
            container.style.opacity = '1';
        });
    }
}

// JSON 데이터를 Mermaid 플로우차트 문법으로 변환
function convertJsonToMermaid(nodes) {
    if (!nodes || nodes.length === 0) return '';
    
    let mermaidCode = 'flowchart TD\n';
    
    // 노드 정의 및 연결 생성
    const nodeMap = new Map();
    nodes.forEach(node => {
        nodeMap.set(node.id, node);
    });
    
    // 언더바로 그룹화된 노드 찾기 (예: BARP960001_11, BARP960001_21 등)
    const groupedNodes = new Map(); // key: baseId (예: BARP960001), value: 노드 배열
    const processedNodes = new Set(); // 이미 그룹화된 노드 추적
    
    nodes.forEach(node => {
        if (node.id.includes('_')) {
            const baseId = node.id.split('_')[0];
            if (!groupedNodes.has(baseId)) {
                groupedNodes.set(baseId, []);
            }
            groupedNodes.get(baseId).push(node);
            processedNodes.add(node.id);
        }
    });
    
    // Process Automation 노드 생성 (그룹화된 노드들)
    groupedNodes.forEach((groupNodes, baseId) => {
        const safeBaseId = baseId.replace(/[^a-zA-Z0-9_]/g, '_');
        
        // name에서 공통된 앞부분 추출 (언더바로 스플릿)
        let commonName = '';
        if (groupNodes.length > 0) {
            const firstNodeName = groupNodes[0].name;
            if (firstNodeName.includes('_')) {
                commonName = firstNodeName.split('_')[0];
            } else {
                commonName = firstNodeName;
            }
        }
        
        // 따옴표 이스케이프
        const safeName = commonName.replace(/"/g, '&quot;');
        const safeBaseIdDisplay = baseId.replace(/"/g, '&quot;');
        
        // Process Automation shape 사용
        // 첫 번째 줄: baseId (bold), 두 번째 줄: name
        const label = `**${safeBaseIdDisplay}**<br/>${safeName}`;
        mermaidCode += `    ${safeBaseId}@{ shape: procs, label: "${label}"}\n`;
        
        // 그룹화된 노드들의 정보를 전역 변수에 저장 (모달에서 사용)
        if (!window.processAutomationGroups) {
            window.processAutomationGroups = new Map();
        }
        window.processAutomationGroups.set(safeBaseId, groupNodes);
    });
    
    // 일반 노드 정의 (그룹화되지 않은 노드들)
    nodes.forEach(node => {
        if (!processedNodes.has(node.id)) {
            const safeId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
            const nodeId = node.id.replace(/"/g, '&quot;');
            const nodeName = node.name.replace(/"/g, '&quot;');
            // 첫 번째 줄: id (bold), 두 번째 줄: name
            // Mermaid에서 <br/>로 줄바꿈, **text**로 bold
            const label = `**${nodeId}**<br/>${nodeName}`;
            mermaidCode += `    ${safeId}["${label}"]\n`;
        }
    });
    
    // 일반 노드들의 연결 생성 (그룹화되지 않은 노드만)
    nodes.forEach(node => {
        // 그룹화된 노드는 건너뛰기 (나중에 별도 처리)
        if (node.id.includes('_')) {
            return;
        }
        
        const fromId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
        
        // next 배열의 각 노드로 연결
        if (node.next && node.next.length > 0) {
            const processedConnections = new Set(); // 중복 연결 방지
            
            node.next.forEach(nextId => {
                let actualToId = nextId.replace(/[^a-zA-Z0-9_]/g, '_');
                
                // next 노드가 그룹화된 노드의 일부인지 확인
                if (nextId.includes('_')) {
                    const nextBaseId = nextId.split('_')[0];
                    actualToId = nextBaseId.replace(/[^a-zA-Z0-9_]/g, '_');
                }
                
                // 중복 연결 방지
                const connectionKey = `${fromId}-->${actualToId}`;
                if (fromId !== actualToId && !processedConnections.has(connectionKey)) {
                    processedConnections.add(connectionKey);
                    mermaidCode += `    ${fromId} --> ${actualToId}\n`;
                }
            });
        }
    });
    
    // 그룹화된 노드들의 연결 처리
    groupedNodes.forEach((groupNodes, baseId) => {
        const safeBaseId = baseId.replace(/[^a-zA-Z0-9_]/g, '_');
        const processedConnections = new Set(); // 중복 연결 방지
        
        // 그룹 내 모든 노드의 next를 확인하여 공통 next 찾기
        const commonNext = new Set();
        groupNodes.forEach(node => {
            if (node.next && node.next.length > 0) {
                node.next.forEach(nextId => {
                    // next 노드가 같은 그룹이 아니면 추가
                    if (!nextId.includes('_') || nextId.split('_')[0] !== baseId) {
                        commonNext.add(nextId);
                    }
                });
            }
        });
        
        // 공통 next로 연결
        commonNext.forEach(nextId => {
            let actualToId = nextId.replace(/[^a-zA-Z0-9_]/g, '_');
            
            // next 노드가 그룹화된 노드인지 확인
            if (nextId.includes('_')) {
                const nextBaseId = nextId.split('_')[0];
                actualToId = nextBaseId.replace(/[^a-zA-Z0-9_]/g, '_');
            }
            
            const connectionKey = `${safeBaseId}-->${actualToId}`;
            if (safeBaseId !== actualToId && !processedConnections.has(connectionKey)) {
                processedConnections.add(connectionKey);
                mermaidCode += `    ${safeBaseId} --> ${actualToId}\n`;
            }
        });
    });
    
    // 일반 노드에서 그룹화된 노드로의 연결 처리 (prev)
    nodes.forEach(node => {
        // 그룹화되지 않은 노드만 처리
        if (node.id.includes('_')) {
            return;
        }
        
        const fromId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
        
        // prev 배열 확인하여 그룹화된 노드로의 연결 생성
        if (node.prev && node.prev.length > 0) {
            const processedConnections = new Set();
            
            node.prev.forEach(prevId => {
                // prev 노드가 그룹화된 노드인지 확인
                if (prevId.includes('_')) {
                    const prevBaseId = prevId.split('_')[0];
                    const actualFromId = prevBaseId.replace(/[^a-zA-Z0-9_]/g, '_');
                    
                    const connectionKey = `${actualFromId}-->${fromId}`;
                    if (actualFromId !== fromId && !processedConnections.has(connectionKey)) {
                        processedConnections.add(connectionKey);
                        mermaidCode += `    ${actualFromId} --> ${fromId}\n`;
                    }
                }
            });
        }
    });
    
    return mermaidCode;
}

// 플로우차트의 실제 크기에 맞게 그리드 조정
function adjustGridToFlowchartSizes(mermaidGrid, count, cols, rows) {
    const flowchartDivs = mermaidGrid.querySelectorAll('.mermaid');
    
    if (flowchartDivs.length === 0) {
        console.warn('[adjustGridToFlowchartSizes] 플로우차트를 찾을 수 없습니다.');
        return;
    }
    
    console.log(`[adjustGridToFlowchartSizes] ${flowchartDivs.length}개의 플로우차트 크기 측정 시작`);
    
    // 각 플로우차트의 실제 크기 측정
    const sizes = [];
    flowchartDivs.forEach((div, index) => {
        const svg = div.querySelector('svg');
        if (svg) {
            const svgRect = svg.getBoundingClientRect();
            
            // SVG 크기 + 패딩을 고려한 실제 크기
            const width = Math.max(svgRect.width, 200) + 60; // 최소 200px, 패딩 60px
            const height = Math.max(svgRect.height, 150) + 60; // 최소 150px, 패딩 60px
            
            sizes.push({ width, height, index });
            
            console.log(`[플로우차트 ${index + 1}] 실제 크기: ${width.toFixed(0)}px x ${height.toFixed(0)}px`);
            
            // 각 플로우차트 div의 크기를 실제 크기에 맞게 설정
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;
            div.style.minWidth = `${width}px`;
            div.style.minHeight = `${height}px`;
        } else {
            // SVG가 아직 렌더링되지 않은 경우 기본 크기 사용
            const defaultWidth = 400;
            const defaultHeight = 300;
            sizes.push({ width: defaultWidth, height: defaultHeight, index });
            div.style.width = `${defaultWidth}px`;
            div.style.height = `${defaultHeight}px`;
        }
    });
    
    // 그리드 레이아웃을 실제 크기에 맞게 조정
    if (count === 1) {
        // 단일 플로우차트는 auto
        mermaidGrid.style.gridTemplateColumns = 'auto';
        mermaidGrid.style.gridTemplateRows = 'auto';
    } else {
        // 여러 플로우차트: 각 열의 최대 너비를 계산
        const columnWidths = [];
        for (let c = 0; c < cols; c++) {
            let maxWidth = 0;
            for (let r = 0; r < rows; r++) {
                const idx = r * cols + c;
                if (idx < sizes.length && sizes[idx]) {
                    maxWidth = Math.max(maxWidth, sizes[idx].width);
                }
            }
            if (maxWidth > 0) {
                columnWidths.push(`${maxWidth}px`);
            } else {
                columnWidths.push('auto');
            }
        }
        
        // 행 높이도 계산
        const rowHeights = [];
        for (let r = 0; r < rows; r++) {
            let maxHeight = 0;
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                if (idx < sizes.length && sizes[idx]) {
                    maxHeight = Math.max(maxHeight, sizes[idx].height);
                }
            }
            if (maxHeight > 0) {
                rowHeights.push(`${maxHeight}px`);
            } else {
                rowHeights.push('auto');
            }
        }
        
        mermaidGrid.style.gridTemplateColumns = columnWidths.join(' ');
        mermaidGrid.style.gridTemplateRows = rowHeights.join(' ');
        
        console.log(`[그리드 크기 조정] 열 너비: ${columnWidths.join(', ')}, 행 높이: ${rowHeights.join(', ')}`);
    }
}

// prev/next 관계로 연결된 노드들을 그룹화
function groupNodesByConnections(allNodes) {
    const nodeMap = new Map();
    allNodes.forEach(node => {
        nodeMap.set(node.id, node);
    });
    
    const visited = new Set();
    const flowcharts = [];
    
    // 모든 노드를 순회
    allNodes.forEach(node => {
        // 이미 방문한 노드는 건너뛰기
        if (visited.has(node.id)) {
            return;
        }
        
        // 연결된 노드들을 찾기 (DFS)
        const connectedNodes = new Set();
        const stack = [node.id];
        
        while (stack.length > 0) {
            const currentNodeId = stack.pop();
            
            if (visited.has(currentNodeId)) {
                continue;
            }
            
            visited.add(currentNodeId);
            const currentNode = nodeMap.get(currentNodeId);
            
            if (currentNode) {
                connectedNodes.add(currentNode);
                
                // prev 노드들 추가
                if (currentNode.prev && currentNode.prev.length > 0) {
                    currentNode.prev.forEach(prevId => {
                        if (!visited.has(prevId) && nodeMap.has(prevId)) {
                            stack.push(prevId);
                        }
                    });
                }
                
                // next 노드들 추가
                if (currentNode.next && currentNode.next.length > 0) {
                    currentNode.next.forEach(nextId => {
                        if (!visited.has(nextId) && nodeMap.has(nextId)) {
                            stack.push(nextId);
                        }
                    });
                }
            }
        }
        
        // 연결된 노드들을 배열로 변환하여 플로우차트로 추가
        if (connectedNodes.size > 0) {
            flowcharts.push(Array.from(connectedNodes));
        }
    });
    
    console.log(`[그룹화 완료] 총 ${flowcharts.length}개의 플로우차트 생성`);
    return flowcharts;
}

// JSON 파일을 읽어서 플로우차트 생성
async function loadFlowchartsFromJson() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('JSON 파일을 불러올 수 없습니다.');
        }
        
        const jsonData = await response.json();
        console.log('[JSON 로드] 노드 데이터:', jsonData);
        
        // JSON이 배열인지 확인
        if (!Array.isArray(jsonData)) {
            console.warn('[경고] JSON 데이터가 배열이 아닙니다.');
            return 0;
        }
        
        // prev/next 관계로 노드들을 그룹화하여 플로우차트 생성
        const flowcharts = groupNodesByConnections(jsonData);
        
        const mermaidGrid = document.getElementById('mermaidGrid');
        if (!mermaidGrid) {
            console.error('mermaidGrid 요소를 찾을 수 없습니다.');
            return 0;
        }
        
        // 기존 내용 제거
        mermaidGrid.innerHTML = '';
        
        // 플로우차트 개수에 따라 그리드 레이아웃 계산
        const count = flowcharts.length;
        let cols, rows;
        
        if (count === 0) {
            cols = 1;
            rows = 1;
        } else if (count === 1) {
            cols = 1;
            rows = 1;
        } else {
            // 정사각형에 가까운 형태로 계산
            cols = Math.ceil(Math.sqrt(count));
            rows = Math.ceil(count / cols);
        }
        
        // 그리드 간격과 패딩 설정 (기본값)
        const gap = '60px';
        const padding = '40px';
        mermaidGrid.style.gap = gap;
        mermaidGrid.style.padding = padding;
        
        console.log(`[그리드 레이아웃] ${count}개 플로우차트 → ${rows}행 ${cols}열 그리드`);
        
        // 각 플로우차트 생성
        flowcharts.forEach((flowchartData, index) => {
            const mermaidCode = convertJsonToMermaid(flowchartData);
            
            const flowchartDiv = document.createElement('div');
            flowchartDiv.className = 'mermaid';
            flowchartDiv.setAttribute('data-flowchart', index + 1);
            flowchartDiv.textContent = mermaidCode;
            
            // 초기 크기 설정 (렌더링 후 실제 크기로 조정됨)
            flowchartDiv.style.width = 'auto';
            flowchartDiv.style.height = 'auto';
            flowchartDiv.style.minWidth = '200px';
            flowchartDiv.style.minHeight = '150px';
            
            mermaidGrid.appendChild(flowchartDiv);
        });
        
        // 초기 그리드 설정 (렌더링 후 실제 크기로 조정됨)
        mermaidGrid.style.gridTemplateColumns = `repeat(${cols}, auto)`;
        mermaidGrid.style.gridTemplateRows = `repeat(${rows}, auto)`;
        
        console.log(`[플로우차트 생성] ${flowcharts.length}개의 플로우차트가 생성되었습니다.`);
        
        // Mermaid 렌더링 실행
        mermaid.run().then(() => {
            // 렌더링 완료 후 각 플로우차트의 실제 크기를 측정하고 그리드 조정
            setTimeout(() => {
                adjustGridToFlowchartSizes(mermaidGrid, flowcharts.length, cols, rows);
            }, 500);
            
            // 렌더링 완료 후 Process Automation 노드에 클릭 이벤트 추가
            // 여러 번 시도 (렌더링이 완전히 끝날 때까지 대기)
            let attempts = 0;
            const maxAttempts = 10;
            
            const tryAttachHandlers = () => {
                attempts++;
                console.log(`[Mermaid 렌더링] 이벤트 핸들러 추가 시도 ${attempts}/${maxAttempts}`);
                
                attachProcessAutomationClickHandlers();
                
                // 노드를 찾지 못했고 아직 시도 횟수가 남았다면 재시도
                if (attempts < maxAttempts) {
                    setTimeout(tryAttachHandlers, 300);
                }
            };
            
            setTimeout(tryAttachHandlers, 500);
        });
        
        return flowcharts.length;
        
    } catch (error) {
        console.error('[오류] JSON 파일 로드 실패:', error);
        return 0;
    }
}

// Process Automation 노드에 클릭 이벤트 추가
function attachProcessAutomationClickHandlers() {
    if (!window.processAutomationGroups) {
        console.log('[attachProcessAutomationClickHandlers] processAutomationGroups가 없습니다.');
        return;
    }
    
    const wrapper = document.getElementById('mermaidWrapper');
    if (!wrapper) {
        console.log('[attachProcessAutomationClickHandlers] mermaidWrapper를 찾을 수 없습니다.');
        return;
    }
    
    let foundCount = 0;
    
    window.processAutomationGroups.forEach((groupNodes, baseId) => {
        // 그룹의 공통 name 앞부분 추출
        const firstNodeName = groupNodes[0].name;
        const commonName = firstNodeName.includes('_') 
            ? firstNodeName.split('_')[0] 
            : firstNodeName;
        
        console.log(`[attachProcessAutomationClickHandlers] baseId: ${baseId}, commonName: ${commonName}`);
        
        // SVG 내에서 해당 name을 가진 노드 찾기
        const svgs = wrapper.querySelectorAll('svg');
        console.log(`[attachProcessAutomationClickHandlers] SVG 개수: ${svgs.length}`);
        
        svgs.forEach((svg, svgIndex) => {
            // Mermaid는 노드 ID를 특정 형식으로 변환함
            // baseId를 포함하는 노드를 찾기
            const safeBaseId = baseId.replace(/[^a-zA-Z0-9_]/g, '_');
            
            // 방법 1: ID로 찾기 (Mermaid가 생성한 노드 ID)
            let targetNode = null;
            
            // 모든 노드 그룹 찾기
            const allNodes = svg.querySelectorAll('g');
            console.log(`[attachProcessAutomationClickHandlers] SVG ${svgIndex}의 노드 개수: ${allNodes.length}`);
            
            allNodes.forEach((node, nodeIndex) => {
                // 노드의 ID나 클래스 확인
                const nodeId = node.getAttribute('id') || '';
                const nodeClass = node.getAttribute('class') || '';
                
                // 방법 1: ID로 찾기
                if (nodeId.includes(safeBaseId) || nodeId.includes(baseId)) {
                    targetNode = node;
                    console.log(`[attachProcessAutomationClickHandlers] ID로 노드 찾음: ${nodeId}`);
                }
                
                // 방법 2: 텍스트로 찾기
                if (!targetNode) {
                    const textElements = node.querySelectorAll('text, p, tspan');
                    textElements.forEach(text => {
                        const textContent = text.textContent ? text.textContent.trim() : '';
                        if (textContent === commonName) {
                            targetNode = node;
                            console.log(`[attachProcessAutomationClickHandlers] 텍스트로 노드 찾음: ${textContent}`);
                        }
                    });
                }
                
                // 방법 3: procs shape의 특정 패턴으로 찾기 (복잡한 path)
                if (!targetNode) {
                    const paths = node.querySelectorAll('path');
                    paths.forEach(path => {
                        const d = path.getAttribute('d') || '';
                        // procs shape는 복잡한 path를 가짐
                        if (d.length > 100) {
                            // 텍스트도 확인
                            const textElements = node.querySelectorAll('text, p, tspan');
                            textElements.forEach(text => {
                                const textContent = text.textContent ? text.textContent.trim() : '';
                                if (textContent === commonName || textContent.includes(commonName)) {
                                    targetNode = node;
                                    console.log(`[attachProcessAutomationClickHandlers] Path 패턴으로 노드 찾음`);
                                }
                            });
                        }
                    });
                }
            });
            
            if (targetNode) {
                foundCount++;
                console.log(`[attachProcessAutomationClickHandlers] 노드 찾음! baseId: ${baseId}`);
                
                // 이벤트 핸들러 생성 (제거 가능하도록 변수에 저장)
                const clickHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log(`[클릭 이벤트] baseId: ${baseId}`);
                    showProcessAutomationModal(baseId, groupNodes);
                };
                
                const mouseEnterHandler = (e) => {
                    e.stopPropagation();
                    targetNode.style.opacity = '0.8';
                    targetNode.style.transition = 'opacity 0.2s ease';
                    targetNode.style.setProperty('cursor', 'pointer', 'important');
                    // body의 커서도 변경하여 부모 요소의 grab 커서 오버라이드
                    document.body.style.cursor = 'pointer';
                };
                
                const mouseLeaveHandler = (e) => {
                    e.stopPropagation();
                    targetNode.style.opacity = '1';
                    // body의 커서를 원래대로 복원
                    document.body.style.cursor = '';
                };
                
                // 기존 이벤트 제거 (데이터 속성으로 추적)
                if (targetNode.dataset.hasHandlers === 'true') {
                    const oldClick = targetNode._clickHandler;
                    const oldEnter = targetNode._mouseEnterHandler;
                    const oldLeave = targetNode._mouseLeaveHandler;
                    
                    if (oldClick) targetNode.removeEventListener('click', oldClick);
                    if (oldEnter) targetNode.removeEventListener('mouseenter', oldEnter);
                    if (oldLeave) targetNode.removeEventListener('mouseleave', oldLeave);
                }
                
                // 새 이벤트 추가
                targetNode._clickHandler = clickHandler;
                targetNode._mouseEnterHandler = mouseEnterHandler;
                targetNode._mouseLeaveHandler = mouseLeaveHandler;
                
                // 이벤트를 캡처 단계에서 처리하여 부모 요소보다 먼저 실행되도록
                targetNode.addEventListener('click', clickHandler, true);
                targetNode.addEventListener('mouseenter', mouseEnterHandler, true);
                targetNode.addEventListener('mouseleave', mouseLeaveHandler, true);
                
                // 스타일 설정 - !important를 사용하여 부모 스타일 오버라이드
                targetNode.style.setProperty('cursor', 'pointer', 'important');
                targetNode.style.pointerEvents = 'auto';
                
                // 자식 요소들의 pointer-events와 cursor 설정
                const childElements = targetNode.querySelectorAll('*');
                childElements.forEach(child => {
                    child.style.pointerEvents = 'auto'; // 자식도 이벤트를 받을 수 있도록
                    child.style.setProperty('cursor', 'pointer', 'important');
                });
                
                // SVG 전체에 mousemove 이벤트 추가하여 노드 위에 있을 때 커서 변경
                const svgMouseMoveHandler = (e) => {
                    const rect = targetNode.getBoundingClientRect();
                    const x = e.clientX;
                    const y = e.clientY;
                    
                    // 노드 영역 내에 있는지 확인
                    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        document.body.style.cursor = 'pointer';
                        // canvas-container의 커서도 변경
                        const canvasContainer = document.getElementById('canvasContainer');
                        if (canvasContainer) {
                            canvasContainer.style.cursor = 'pointer';
                        }
                    } else {
                        document.body.style.cursor = '';
                        const canvasContainer = document.getElementById('canvasContainer');
                        if (canvasContainer) {
                            canvasContainer.style.cursor = 'grab';
                        }
                    }
                };
                
                const svgMouseLeaveHandler = () => {
                    document.body.style.cursor = '';
                    const canvasContainer = document.getElementById('canvasContainer');
                    if (canvasContainer) {
                        canvasContainer.style.cursor = 'grab';
                    }
                };
                
                // 기존 핸들러 제거
                if (targetNode._svgMouseMoveHandler) {
                    svg.removeEventListener('mousemove', targetNode._svgMouseMoveHandler);
                }
                if (targetNode._svgMouseLeaveHandler) {
                    svg.removeEventListener('mouseleave', targetNode._svgMouseLeaveHandler);
                }
                
                svg.addEventListener('mousemove', svgMouseMoveHandler);
                svg.addEventListener('mouseleave', svgMouseLeaveHandler);
                
                // 정리 함수 저장
                targetNode._svgMouseMoveHandler = svgMouseMoveHandler;
                targetNode._svgMouseLeaveHandler = svgMouseLeaveHandler;
                
                targetNode.dataset.hasHandlers = 'true';
                
                console.log(`[attachProcessAutomationClickHandlers] 이벤트 핸들러 추가 완료: baseId=${baseId}`);
            } else {
                console.warn(`[attachProcessAutomationClickHandlers] 노드를 찾을 수 없음: baseId=${baseId}, commonName=${commonName}`);
            }
        });
    });
    
    console.log(`[attachProcessAutomationClickHandlers] 총 ${foundCount}개의 노드에 이벤트 추가 완료`);
}

// Process Automation 모달 표시
function showProcessAutomationModal(baseId, groupNodes) {
    const modal = document.getElementById('processModalOverlay');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) return;
    
    // 모달 내용 생성
    let html = `<div class="node-detail-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
        <h3 style="margin: 0 0 4px 0; color: var(--primary-color);">${baseId}</h3>
        <p style="margin: 0; color: var(--text-secondary); font-size: 12px;">총 ${groupNodes.length}개의 프로세스</p>
    </div>`;
    
    groupNodes.forEach(node => {
        const prevList = node.prev && node.prev.length > 0 ? node.prev.join(', ') : '없음';
        const nextList = node.next && node.next.length > 0 ? node.next.join(', ') : '없음';
        
        html += `
            <div class="node-detail-item">
                <div class="node-id">ID: ${node.id}</div>
                <h4>${node.name}</h4>
                <div class="node-connections">
                    <div><strong>이전 노드:</strong> ${prevList}</div>
                    <div style="margin-top: 4px;"><strong>다음 노드:</strong> ${nextList}</div>
                </div>
            </div>
        `;
    });
    
    modalBody.innerHTML = html;
    modal.classList.add('active');
}

// 모달 닫기 이벤트 (DOMContentLoaded 전에 등록)
function initModalHandlers() {
    const modal = document.getElementById('processModalOverlay');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

// 초기화
let panZoomController;
let nodeSearch;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[DOMContentLoaded] 페이지 로드 완료', new Date().toISOString());
    
    // 모달 핸들러 초기화
    initModalHandlers();
    
    // JSON 파일에서 플로우차트 로드
    const flowchartCount = await loadFlowchartsFromJson();
    
    const container = document.getElementById('canvasContainer');
    const wrapper = document.getElementById('mermaidWrapper');
    
    console.log('[초기 상태 확인]', {
        container: container ? '존재' : '없음',
        wrapper: wrapper ? '존재' : '없음',
        wrapperHasSVG: wrapper?.querySelector('svg') ? '있음' : '없음',
        expectedFlowcharts: flowchartCount
    });
    
    // Mermaid 렌더링 완료를 기다리는 함수
    function waitForMermaidRender(attempts = 0, maxAttempts = 30) {
        const svgs = wrapper?.querySelectorAll('svg');
        const containerRect = container?.getBoundingClientRect();
        const wrapperRect = wrapper?.getBoundingClientRect();
        const expectedSvgs = flowchartCount || 1; // 동적으로 계산된 플로우차트 개수
        
        console.log(`[waitForMermaidRender] 시도 ${attempts + 1}/${maxAttempts}`, {
            svgs: svgs ? `${svgs.length}/${expectedSvgs} 렌더링됨` : '대기중',
            containerRect: containerRect ? {
                width: containerRect.width,
                height: containerRect.height
            } : '없음',
            wrapperRect: wrapperRect ? {
                width: wrapperRect.width,
                height: wrapperRect.height,
                left: wrapperRect.left,
                top: wrapperRect.top
            } : '없음'
        });
        
        if (svgs && svgs.length >= expectedSvgs && containerRect && wrapperRect && wrapperRect.width > 0 && wrapperRect.height > 0) {
            console.log('[Mermaid 렌더링 완료] 초기화 시작', new Date().toISOString());
            
            // 플로우차트 개수에 따라 초기 스케일 조정
            let margin, maxScale;
            
            if (expectedSvgs === 1) {
                // 단일 플로우차트: 100%에 가깝게 표시 (약간의 여유만)
                margin = 0.05; // 5% 여유 공간
                maxScale = 1.0; // 최대 100%
            } else if (expectedSvgs <= 4) {
                // 2-4개: 적당한 여유 공간
                margin = 0.1; // 10% 여유 공간
                maxScale = 1.0;
            } else {
                // 5개 이상: 전체가 보이도록
                margin = 0.1; // 10% 여유 공간
                maxScale = 1.0;
            }
            
            // 전체 그리드가 보이도록 스케일 계산
            const scaleX = (containerRect.width * (1 - margin)) / wrapperRect.width;
            const scaleY = (containerRect.height * (1 - margin)) / wrapperRect.height;
            const initialScale = Math.min(scaleX, scaleY, maxScale);
            
            // 스케일 적용 후 중앙 정렬
            const scaledWidth = wrapperRect.width * initialScale;
            const scaledHeight = wrapperRect.height * initialScale;
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            const scaledCenterX = scaledWidth / 2;
            const scaledCenterY = scaledHeight / 2;
            
            const calculatedPanX = centerX - scaledCenterX;
            const calculatedPanY = centerY - scaledCenterY;
            
            console.log('[위치 및 스케일 계산]', {
                containerSize: { width: containerRect.width, height: containerRect.height },
                wrapperSize: { width: wrapperRect.width, height: wrapperRect.height },
                calculatedScale: initialScale,
                scaledSize: { width: scaledWidth, height: scaledHeight },
                containerCenter: { x: centerX, y: centerY },
                scaledCenter: { x: scaledCenterX, y: scaledCenterY },
                calculatedPan: { x: calculatedPanX, y: calculatedPanY }
            });
            
            panZoomController = new PanZoomController(container, wrapper);
            panZoomController.scale = initialScale;
            panZoomController.panX = calculatedPanX;
            panZoomController.panY = calculatedPanY;
            panZoomController.setInitialView(initialScale, calculatedPanX, calculatedPanY);
            panZoomController.updateTransform();
            
            console.log('[초기화 완료]', {
                finalPanX: panZoomController.panX,
                finalPanY: panZoomController.panY,
                finalScale: panZoomController.scale,
                appliedTransform: wrapper.style.transform
            });
            
            // 초기화 버튼 이벤트 리스너
            const resetBtn = document.getElementById('zoomResetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    if (panZoomController) {
                        panZoomController.resetToInitialView();
                    }
                });
            }
            
            nodeSearch = new NodeSearch();
            
            // 초기화 후 노드 수집 재시도
            setTimeout(() => {
                if (nodeSearch) {
                    nodeSearch.collectNodes();
                }
            }, 500);
        } else if (attempts < maxAttempts) {
            setTimeout(() => waitForMermaidRender(attempts + 1, maxAttempts), 100);
        } else {
            console.error('[오류] Mermaid 렌더링 대기 시간 초과');
            // 그래도 초기화 시도
            if (container && wrapper) {
                panZoomController = new PanZoomController(container, wrapper);
                nodeSearch = new NodeSearch();
            }
        }
    }
    
    // 즉시 시작 (첫 시도)
    waitForMermaidRender();
});

