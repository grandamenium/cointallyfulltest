import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { FormsService } from './forms.service';
import { GenerateFormDto } from './dto/generate-form.dto';
import { EmailFormDto } from './dto/email-form.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private formsService: FormsService) {}

  @Get()
  async listForms(@CurrentUser() user: any) {
    return this.formsService.listForms(user.id);
  }

  @Post('generate')
  async generateForm(@CurrentUser() user: any, @Body() dto: GenerateFormDto) {
    return this.formsService.generateForm(user.id, dto);
  }

  @Get(':id')
  async getForm(@CurrentUser() user: any, @Param('id') id: string) {
    return this.formsService.getForm(user.id, id);
  }

  @Get(':id/preview')
  async previewForm(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const html = await this.formsService.getPreview(user.id, id);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get(':id/download')
  async downloadForm(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('format') format: string = 'pdf',
    @Res() res: Response,
  ) {
    const { filePath, fileName, contentType } = await this.formsService.downloadForm(user.id, id, format);

    if (!filePath || !existsSync(filePath)) {
      throw new NotFoundException('File not found or not yet generated');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Post(':id/email')
  async emailForm(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: EmailFormDto) {
    return this.formsService.emailForm(user.id, id, dto);
  }

  @Delete(':id')
  async deleteForm(@CurrentUser() user: any, @Param('id') id: string) {
    return this.formsService.deleteForm(user.id, id);
  }
}
