using AutoMapper;

using API.Models;
using API.DTOs;

public class ContentProfile : Profile {
    public ContentProfile() {
        CreateMap<ContentDetail, ContentPartial>()
            .ForMember(dest => dest.Detail, opt => opt.Ignore())  // Prevent cycle
            .ForMember(dest => dest.Lists, opt => opt.Ignore());  // Detail has no lists anyway

        CreateMap<ContentDetail, ContentDTO>();

        CreateMap<ContentDetail, ContentPartialDTO>();

        // CreateMap<ContentDetail, ContentSimpleDTO>();

        CreateMap<ContentPartial, ContentPartialDTO>().ReverseMap();

        CreateMap<Genre, GenreDTO>();
    }
}